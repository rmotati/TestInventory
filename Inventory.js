// Inventory.js

var _table_ = document.createElement("table"),
  _tr_ = document.createElement("tr"),
  _th_ = document.createElement("th"),
  _td_ = document.createElement("td");
const dataTable = document.getElementById("dataTable");
const policiesCountEl = document.getElementById("policiesCount");

dataTable.innerHTML = "";
var data;
var policyMetaData;
var metaDataArray = [];
var buggingEnforcedData = [];
var incubatingData = [];

var policiesCount;
var filteredData;
var filteredData1;
var searchData;
var alipath = "ali_config/";
var mulesoftpath = "mulesoft_config/";

fetcMetadata("controls.yaml");
fetchBuggingEnforcedData("policies.yaml");
fetchBuggingEnforcedData("bugging.yaml");

function fetchBuggingEnforcedData(policystatus) {
  fetch(policystatus)
    .then((response) => response.text())
    .then((text) => {
      let data = jsyaml.load(text);
      if (data.enforced) {
        data.enforced.forEach((element) => {
          buggingEnforcedData.push(element);
        });
      } else if (data.bugging) {
        data.bugging.forEach((element) => {
          buggingEnforcedData.push(element);
        });
      }
    })
    .catch((error) => console.error("Error loading YAML file:", error));
}

function getIncubatingData() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((tab) => tab.classList.remove("active"));
      this.classList.add("active");
    });
  });

  incubatingData = [];
  console.log(policyMetaData.policies);

  const filteredData = policyMetaData.policies.filter((policy) =>
    buggingEnforcedData.every(
      (buggingEnforced) => buggingEnforced.namespace !== policy.names[0]
    )
  );
  incubatingData = filteredData;
  console.log("incubating", incubatingData);
  var tabName = document
    .querySelector(".side-tab.active")
    .getAttribute("data-table");

  getDatafromtabs(tabName, "incubating");
}

function fetcMetadata(policystatus) {
  // Fetch and process the YAML data
  fetch(policystatus)
    .then((response) => response.text())
    .then((text) => {
      policyMetaData = jsyaml.load(text);
      fetchyamldata("policies.yaml");
    })
    .catch((error) => console.error("Error loading YAML file:", error));
  buggingEnforcedData = [];
  if (policystatus.includes("ali")) {
    fetchBuggingEnforcedData(alipath + "policies.yaml");
    fetchBuggingEnforcedData(alipath + "bugging.yaml");
  } else if (policystatus.includes("mulesoft")) {
    fetchBuggingEnforcedData(mulesoftpath + "policies.yaml");
    fetchBuggingEnforcedData(mulesoftpath + "bugging.yaml");
  } else {
    fetchBuggingEnforcedData("policies.yaml");
    fetchBuggingEnforcedData("bugging.yaml");
  }
}

function fetchyamldata(policystatus) {
  var sideTab = document.querySelector(".side-tab.active");
  if (sideTab.parentElement.getAttribute("data-submenu") === "ali") {
    policystatus = alipath + policystatus;
  } else if (
    sideTab.parentElement.getAttribute("data-submenu") === "mulesoft"
  ) {
    policystatus = mulesoftpath + policystatus;
  }

  dataTable.innerHTML = "";

  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((tab) => tab.classList.remove("active"));
      this.classList.add("active");
    });
  });
  if (policystatus) {
    var sideTabName = document
      .querySelector(".side-tab.active")
      .getAttribute("data-table");
    // Fetch and process the YAML data
    fetch(policystatus)
      .then((response) => response.text())
      .then((text) => {
        data = jsyaml.load(text);
        getDatafromtabs(sideTabName);
      })
      .catch((error) => console.error("Error loading YAML file:", error));
  }
}

function getDatafromtabs(sideTabName, mainTab) {
  var mainTabName = document
    .querySelector(".tab.active")
    .getAttribute("data-table");

  if (mainTab === "incubating") {
    mainTabName = "incubating";
  }
  const sideTabs = document.querySelectorAll(".side-tab");
  sideTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      sideTabs.forEach((tab) => tab.classList.remove("active"));
      this.classList.add("active");
    });
  });

  if (mainTabName === "bugging") {
    let finalData = data.bugging;
    let buggingData = prepareFinalData(finalData);
    renderTableForBugging(buggingData, sideTabName);
  } else if (mainTabName === "enforce") {
    let finalData = data.enforced;
    let enforcedData = prepareFinalData(finalData, mainTabName);
    renderEnforceTable(enforcedData, sideTabName);
  } else {
    renderTableForBugging(incubatingData, sideTabName);
  }
}

function prepareFinalData(finalData, mainTabName) {
  metaDataArray = [];
  for (var i = 0; i < finalData.length; i++) {
    let namespaces = policyMetaData.policies.find(
      (o) => o.names[0] === finalData[i].namespace
    );
    if (mainTabName === "enforce" && finalData[i].exceptions && namespaces) {
      namespaces.exceptions = finalData[i].exceptions;
    }
    if (namespaces) {
      metaDataArray.push(namespaces);
    }
  }
  return metaDataArray;
}

// Function to render the table based on selected category
function renderTableForBugging(data, sideTabName) {
  dataTable.innerHTML = "";
  if (sideTabName === "checkov" || sideTabName === "ali_checkov") {
    let policyNames = [
      "checkov.ckv_aws",
      "checkov.ckv2_aws",
      "sfdc_ckv_tf",
      "checkov.ckv_ali",
      "checkov.ckv_mulesoft",
      "sfdc_ckv_mulesoft",
    ];
    filteredData = data.filter((item) =>
      policyNames.some((name) => item.names[0].includes(name))
    );
    searchData = data.filter((item) =>
      policyNames.some((name) => item.names[0].includes(name))
    );
  } else if (sideTabName === "ali") {
    let policyNames = ["sfdc_ckv_ali"];
    filteredData = data.filter((item) =>
      policyNames.some((name) => item.names[0].includes(name))
    );
  } else if (sideTabName === "govcloud") {
    let policyNames = ["sfdc_ckv_govcloud"];
    filteredData = data.filter((item) =>
      policyNames.some((name) => item.names[0].includes(name))
    );
  } else if (sideTabName === "multisubstrate") {
    let policyNames = ["sfdc_ckv_multisubstrate"];
    filteredData = data.filter((item) =>
      policyNames.some((name) => item.names[0].includes(name))
    );
  } else if (sideTabName === "intake") {
    filteredData = data.filter((item) =>
      item.names[0].includes(`mandatory.development`)
    );
  } else if (sideTabName === "build") {
    filteredData = data.filter((item) =>
      item.names[0].includes(`mandatory.build`)
    );
  } else {
    filteredData = data.filter((item) =>
      item.names[0].includes(`release.${sideTabName}`)
    );
  }
  policiesCount = filteredData.length;
  const table = document.createElement("table");
  table.innerHTML = "";
  const headerRow = table.insertRow();
  headerRow.innerHTML = `
            <th>Serial</th>
            <th>Policy Name</th>
            <th>Policy ID</th>
            <th>Priority</th>
            <th>LOE</th>
            <th>Category</th>
            <th>Description</th>
            <th>Resource</th>
            <th>Support Page</th>
            <th>Vulnarability Category</th>
            <th>Tags</th>
    `;
  filteredData.forEach((item, index) => {
    const row = table.insertRow();
    row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.names[0]}</td>
            <td><a href="${item.supportPage}" target="_blank">${
      item.id
    }</a></td>
            <td>${item.priority}</td>
            <td>${item.levelOfEffort}</td>
            <td>${item.category}</td>
            <td>${item.description}</td>
            <td>${item.resource}</td>
            <td><a href="${item.supportPage}" target="_blank">${
      item.supportPage
    }</a></td>
            <td>${item.vulnerabilityCategory}</td>
            <td>${item.tags}</td>
        `;
  });

  dataTable.appendChild(table);
  policiesCountEl.innerText = "Total Policies : " + policiesCount;
}

function renderEnforceTable(data, sideTabName) {
  dataTable.innerHTML = "";

  if (sideTabName === "checkov") {
    let policyNames = [
      "checkov.ckv_aws",
      "checkov.ckv2_aws",
      "sfdc_ckv_tf",
      "checkov.ckv_ali",
      "checkov.ckv_mulesoft",
      "sfdc_ckv_mulesoft",
    ];
    filteredData = data.filter((item) =>
      policyNames.some((name) => item.names[0].includes(name))
    );
    searchData = data.filter((item) =>
      policyNames.some((name) => item.names[0].includes(name))
    );
  } else if (sideTabName === "ali") {
    let policyNames = ["sfdc_ckv_ali"];
    filteredData = data.filter((item) =>
      policyNames.some((name) => item.names[0].includes(name))
    );
  } else if (sideTabName === "govcloud") {
    let policyNames = ["sfdc_ckv_govcloud"];
    filteredData = data.filter((item) =>
      policyNames.some((name) => item.names[0].includes(name))
    );
  } else if (sideTabName === "multisubstrate") {
    let policyNames = ["sfdc_ckv_multisubstrate"];
    filteredData = data.filter((item) =>
      policyNames.some((name) => item.names[0].includes(name))
    );
  } else if (sideTabName === "intake") {
    filteredData = data.filter((item) =>
      item.names[0].includes(`mandatory.development`)
    );
  } else if (sideTabName === "build") {
    filteredData = data.filter((item) =>
      item.names[0].includes(`mandatory.build`)
    );
  } else {
    filteredData = data.filter((item) =>
      item.names[0].includes(`release.${sideTabName}`)
    );
  }
  policiesCount = filteredData.length;
  const table = document.createElement("table");
  const headerRow = table.insertRow();
  headerRow.innerHTML = `
      <th>Serial</th>
      <th>Policy Name</th>
      <th>Policy ID</th>
      <th>Priority</th>
      <th>LOE</th>
      <th>Category</th>
      <th>Description</th>
      <th>Resource</th>
      <th>Support Page</th>
      <th>Vulnerability Category</th>
      <th>Tags</th>
      <th>Exceptions</th>
    `;

  filteredData.forEach((item, index) => {
    const row = table.insertRow();
    const exceptions = item.exceptions
      ? item.exceptions.map((ex) => ex.service).join(", ")
      : "";

    row.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.names[0]}</td>
        <td><a href="${item.supportPage}" target="_blank">${item.id}</a></td>
        <td>${item.priority}</td>
        <td>${item.levelOfEffort}</td>
        <td>${item.category}</td>
        <td>${item.description}</td>
        <td>${item.resource}</td>
        <td><a href="${item.supportPage}" target="_blank">${
      item.supportPage
    }</a></td>
        <td>${item.vulnerabilityCategory}</td>
        <td>${item.tags}</td>
        <td>${exceptions}</td>
      `;
  });

  dataTable.appendChild(table);
  policiesCountEl.innerText = "Total Policies : " + policiesCount;
}

const searchInput = document.getElementById("searchPolicy");
searchInput.addEventListener("input", function () {
  var tabName = document
    .querySelector(".tab.active")
    .getAttribute("data-table");
  var sideTabName = document
    .querySelector(".side-tab.active")
    .getAttribute("data-table");
  const searchText = this.value.toLowerCase();

  if (tabName === "bugging") {
    var buggingData = data.bugging
      .filter((item) => item.namespace.includes(sideTabName))
      .filter((item) => item.namespace.includes(sideTabName));
    var filteredData = buggingData.filter((item) => {
      return Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchText)
      );
    });
    let finalData = prepareFinalData(filteredData, tabName);
    renderTableForBugging(finalData, sideTabName);
  } else if (tabName === "enforce") {
    var enforcedData = data.enforced
      .filter((item) => item.namespace.includes(sideTabName))
      .filter((item) => item.namespace.includes(sideTabName));
    var filteredData = enforcedData.filter((item) => {
      return Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchText)
      );
    });
    let finalData = prepareFinalData(filteredData, tabName);
    renderEnforceTable(finalData, sideTabName);
  } else {
    var unEnforcedData = data.unenforced
      .filter((item) => item.namespace.includes(sideTabName))
      .filter((item) => item.namespace.includes(sideTabName));
    var filteredData = unEnforcedData.filter((item) => {
      return Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchText)
      );
    });
    renderEnforceTable(filteredData, sideTabName);
  }
});

var dropdown = document.getElementsByClassName("dropdown-btn");
var i;
for (i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function () {
    this.childNodes[1].classList.toggle("fa-caret-down");
    this.childNodes[1].classList.toggle("fa-caret-right");
    this.classList.toggle("active");
    var dropdownContent = this.nextElementSibling;
    if (dropdownContent.style.display === "none") {
      dropdownContent.style.display = "block";
    } else {
      dropdownContent.style.display = "none";
    }
  });
}

var subdropdown = document.getElementsByClassName("sub-dropdown-btn");
var i;
for (i = 0; i < subdropdown.length; i++) {
  // display first dropdown as expanded
  let firstsubmenu = subdropdown[0];
  var subdropdownContent = firstsubmenu.nextElementSibling;
  subdropdownContent.style.display = "block";

  subdropdown[i].addEventListener("click", function () {
    var subdropdownContent = this.nextElementSibling;
    if (
      subdropdownContent.style.display === "none" ||
      subdropdownContent.style.display === ""
    ) {
      subdropdownContent.style.display = "block";
    } else {
      subdropdownContent.style.display = "none";
    }
  });
}

document.querySelectorAll(".sub-dropdown-btn").forEach((header) => {
  header.addEventListener("click", function () {
    // Close all open menus
    document.querySelectorAll(".sub-dropdown-container").forEach((submenu) => {
      for (let item of submenu.children) {
        item.classList.remove("active");
      }
      submenu.parentElement.childNodes[1].childNodes[1].classList.remove(
        "fa-caret-down"
      );
      submenu.parentElement.childNodes[1].childNodes[1].classList.add(
        "fa-caret-right"
      );
      submenu.style.display = "none";
    });

    // Get the corresponding submenu and toggle its visibility
    const menu = this.parentElement.querySelector(".sub-dropdown-container");

    menu.childNodes[1].classList.add("active");
    menu.parentElement.childNodes[1].childNodes[1].classList.remove(
      "fa-caret-right"
    );
    menu.parentElement.childNodes[1].childNodes[1].classList.add(
      "fa-caret-down"
    );
    menu.style.display = "block";
  });
});

// Functions to handle clicking on Git and Slack icons
document.getElementById("git-icon").addEventListener("click", function () {
  window.open("https://git.soma.salesforce.com/opa/falcon-policies", "_blank");
});

document.getElementById("slack-icon").addEventListener("click", function () {
  window.open(
    "https://salesforce-internal.slack.com/archives/C0299NZBQKF",
    "_blank"
  );
});
