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

fetcMetadata("controls.yaml");
fetcBuggingEnforcedData("policies.yaml");
fetcBuggingEnforcedData("bugging.yaml");

function fetcMetadata(policystatus) {
  // Fetch and process the YAML data
  fetch(policystatus)
    .then((response) => response.text())
    .then((text) => {
      policyMetaData = jsyaml.load(text);
      fetchyamldata("policies.yaml");
    })
    .catch((error) => console.error("Error loading YAML file:", error));
}

function fetcBuggingEnforcedData(policystatus) {
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

  const obj = policyMetaData.policies.filter((policy) =>
    buggingEnforcedData.every(
      (buggingEnforced) => buggingEnforced.namespace !== policy.names[0]
    )
  );
  incubatingData = obj;
  var tabName = document
    .querySelector(".side-tab.active")
    .getAttribute("data-table");

  getDatafromtabs(tabName, "incubating");
}

function fetchyamldata(policystatus) {
  dataTable.innerHTML = "";

  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((tab) => tab.classList.remove("active"));
      this.classList.add("active");
    });
  });
  if (policystatus) {
    var tabName = document
      .querySelector(".side-tab.active")
      .getAttribute("data-table");
    // Fetch and process the YAML data
    fetch(policystatus)
      .then((response) => response.text())
      .then((text) => {
        data = jsyaml.load(text);
        getDatafromtabs(tabName);
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
    if (mainTabName === "enforce") {
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
  if (sideTabName === "checkov") {
    let policyNames = [
      "checkov.ckv_aws",
      "checkov.ckv2_aws",
      "sfdc_ckv_tf",
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
            <td><a href="${item.supportPage}" target="_blank">${item.id}</a></td>
            <td>${item.priority}</td>
            <td>${item.levelOfEffort}</td>
            <td>${item.category}</td>
            <td>${item.description}</td>
            <td>${item.resource}</td>
            <td><a href="${item.supportPage}" target="_blank">${item.supportPage}</a></td>
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
    const exceptions = item.exceptions? item.exceptions.map((ex) => ex.service).join(", "): "";

    row.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.names[0]}</td>
        <td><a href="${item.supportPage}" target="_blank">${item.id}</a></td>
        <td>${item.priority}</td>
        <td>${item.levelOfEffort}</td>
        <td>${item.category}</td>
        <td>${item.description}</td>
        <td>${item.resource}</td>
        <td><a href="${item.supportPage}" target="_blank">${item.supportPage}</a></td>
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
  subdropdown[i].addEventListener("click", function () {
    this.childNodes[1].classList.toggle("fa-caret-down");
    this.childNodes[1].classList.toggle("fa-caret-right");
    this.classList.toggle("active");
    var subdropdownContent = this.nextElementSibling;
    console.log(subdropdownContent)
    if (subdropdownContent.style.display === "none" || subdropdownContent.style.display === "") {
      subdropdownContent.style.display = "block";
    } else {
      subdropdownContent.style.display = "none";
    }
  });
}

var ppdropdown = document.getElementsByClassName("pp-dropdown-btn");
var i;
for (i = 0; i < ppdropdown.length; i++) {
  ppdropdown[i].addEventListener("click", function () {
    this.childNodes[1].classList.toggle("fa-caret-down");
    this.childNodes[1].classList.toggle("fa-caret-right");
    this.classList.toggle("active");
    var dropdownContent = this.nextElementSibling;
    if (dropdownContent.style.display === "block") {
      dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "block";
    }
  });
}

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
