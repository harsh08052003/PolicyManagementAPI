import { parentPort, workerData } from "worker_threads";
import xlsx from "xlsx";
import moment from "moment";
import { getAllAgents, insertAgents } from "../agent/model.js";
import { getAllUsers, insertUsers } from "../user/model.js";
import { getAllAccounts, insertAccounts } from "../account/model.js";
import { getAllLobs, insertLobs } from "../lob/model.js";
import { getAllCarriers, insertCarriers } from "../carrier/model.js";
import { getAllPolicies, insertPolicies } from "../policy/model.js";

function parseDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val;
  let d = moment(val);
  if (d.isValid()) return d.toDate();
  return null;
}

function asText(val) {
  if (val === undefined || val === null) return "";
  return String(val).trim();
}

async function loadFile(filePath) {
  let workbook = xlsx.readFile(filePath, { cellDates: true });
  let sheetName = workbook.SheetNames[0];
  let rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  return rows;
}

function fillMapFromDb(list, key) {
  let map = new Map();
  for (let i = 0; i < list.length; i++) {
    let item = list[i];
    if (item[key]) map.set(item[key], item._id);
  }
  return map;
}

function unwrap(result, message) {
  if (!result || !result.status) {
    throw new Error(message);
  }
  return result.data || [];
}

async function processSheet(filePath) {
  const rows = await loadFile(filePath);
  if (!rows.length) {
    throw new Error("file is empty");
  }

  const existingAgents = unwrap(await getAllAgents(), "failed to get agents");
  const existingUsers = unwrap(await getAllUsers(), "failed to get users");
  const existingAccounts = unwrap(await getAllAccounts(), "failed to get accounts");
  const existingLobs = unwrap(await getAllLobs(), "failed to get lob");
  const existingCarriers = unwrap(await getAllCarriers(), "failed to get carriers");
  const existingPolicies = unwrap(await getAllPolicies(), "failed to get policies");

  let agentMap = fillMapFromDb(existingAgents, "agentName");
  let userMap = new Map();
  let accountMap = fillMapFromDb(existingAccounts, "accountName");
  let lobMap = fillMapFromDb(existingLobs, "categoryName");
  let carrierMap = fillMapFromDb(existingCarriers, "companyName");
  let policySet = new Set();

  for (let u = 0; u < existingUsers.length; u++) {
    let user = existingUsers[u];
    let userKey = user.email || (user.firstName + "_" + user.phone);
    userMap.set(userKey, user._id);
  }

  for (let p = 0; p < existingPolicies.length; p++) {
    if (existingPolicies[p].policyNumber) {
      policySet.add(existingPolicies[p].policyNumber);
    }
  }

  let newAgents = [];
  let newUsers = [];
  let newAccounts = [];
  let newLobs = [];
  let newCarriers = [];

  let pendingAgents = new Set();
  let pendingUsers = new Map();
  let pendingAccounts = new Set();
  let pendingLobs = new Set();
  let pendingCarriers = new Set();

  for (let r = 0; r < rows.length; r++) {
    let row = rows[r];
    let agentName = asText(row.agent);
    let accountName = asText(row.account_name);
    let categoryName = asText(row.category_name);
    let companyName = asText(row.company_name);
    let email = asText(row.email);
    let firstName = asText(row.firstname);
    let phone = asText(row.phone);
    let userKey = email || (firstName + "_" + phone);

    if (agentName && !agentMap.has(agentName) && !pendingAgents.has(agentName)) {
      pendingAgents.add(agentName);
      newAgents.push({ agentName: agentName });
    }

    if (accountName && !accountMap.has(accountName) && !pendingAccounts.has(accountName)) {
      pendingAccounts.add(accountName);
      newAccounts.push({ accountName: accountName });
    }

    if (categoryName && !lobMap.has(categoryName) && !pendingLobs.has(categoryName)) {
      pendingLobs.add(categoryName);
      newLobs.push({ categoryName: categoryName });
    }

    if (companyName && !carrierMap.has(companyName) && !pendingCarriers.has(companyName)) {
      pendingCarriers.add(companyName);
      newCarriers.push({ companyName: companyName });
    }

    if (userKey && !userMap.has(userKey) && !pendingUsers.has(userKey)) {
      pendingUsers.set(userKey, true);
      newUsers.push({
        firstName: firstName,
        dob: parseDate(row.dob),
        address: asText(row.address),
        phone: phone,
        state: asText(row.state),
        zip: asText(row.zip),
        email: email,
        gender: asText(row.gender),
        userType: asText(row.userType)
      });
    }
  }

  if (newAgents.length) {
    const agentRes = unwrap(await insertAgents(newAgents), "failed to insert agents");
    for (let a = 0; a < newAgents.length; a++) {
      agentMap.set(newAgents[a].agentName, agentRes.insertedIds[a]);
    }
  }

  if (newAccounts.length) {
    const accRes = unwrap(await insertAccounts(newAccounts), "failed to insert accounts");
    for (let ac = 0; ac < newAccounts.length; ac++) {
      accountMap.set(newAccounts[ac].accountName, accRes.insertedIds[ac]);
    }
  }

  if (newLobs.length) {
    const lobRes = unwrap(await insertLobs(newLobs), "failed to insert lob");
    for (let l = 0; l < newLobs.length; l++) {
      lobMap.set(newLobs[l].categoryName, lobRes.insertedIds[l]);
    }
  }

  if (newCarriers.length) {
    const carRes = unwrap(await insertCarriers(newCarriers), "failed to insert carriers");
    for (let c = 0; c < newCarriers.length; c++) {
      carrierMap.set(newCarriers[c].companyName, carRes.insertedIds[c]);
    }
  }

  if (newUsers.length) {
    const userRes = unwrap(await insertUsers(newUsers), "failed to insert users");
    for (let nu = 0; nu < newUsers.length; nu++) {
      let saved = newUsers[nu];
      let savedKey = saved.email || (saved.firstName + "_" + saved.phone);
      userMap.set(savedKey, userRes.insertedIds[nu]);
    }
  }

  let policyDocs = [];
  let seenInFile = new Set();

  for (let i = 0; i < rows.length; i++) {
    let item = rows[i];
    let policyNumber = asText(item.policy_number);
    if (!policyNumber || policySet.has(policyNumber) || seenInFile.has(policyNumber)) continue;

    let mail = asText(item.email);
    let fName = asText(item.firstname);
    let ph = asText(item.phone);
    let uKey = mail || (fName + "_" + ph);

    let userId = userMap.get(uKey);
    if (!userId) continue;

    seenInFile.add(policyNumber);
    policyDocs.push({
      policyNumber: policyNumber,
      policyStartDate: parseDate(item.policy_start_date),
      policyEndDate: parseDate(item.policy_end_date),
      categoryId: lobMap.get(asText(item.category_name)) || null,
      companyId: carrierMap.get(asText(item.company_name)) || null,
      userId: userId,
      agentId: agentMap.get(asText(item.agent)) || null,
      accountId: accountMap.get(asText(item.account_name)) || null
    });
  }

  let policyInserted = 0;
  if (policyDocs.length) {
    const polRes = unwrap(await insertPolicies(policyDocs), "failed to insert policies");
    policyInserted = polRes.insertedCount || policyDocs.length;
  }

  return {
    totalRows: rows.length,
    agents: newAgents.length,
    users: newUsers.length,
    accounts: newAccounts.length,
    lobs: newLobs.length,
    carriers: newCarriers.length,
    policies: policyInserted
  };
}

try {
  const result = await processSheet(workerData.filePath);
  parentPort.postMessage(result);
} catch (err) {
  parentPort.postMessage({ error: err.message || "failed to process file" });
}
