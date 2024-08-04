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
var searchData;
// var tableName = "checkov"
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
  // Fetch and process the YAML data
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

function getIncuBatingData() {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        tabs.forEach((tab) => tab.classList.remove("active"));
        this.classList.add("active");
      });
    });


  incubatingData = [];

  
  const obj =  policyMetaData.policies.filter(policy  => 
    buggingEnforcedData.every(buggingEnforced => buggingEnforced.namespace !== policy.names[0])
  );
  incubatingData = obj;
  var tabName = document
    .querySelector(".side-tab.active")
    .getAttribute("data-table");

  getDatafromtabs(tabName,mainTab="incubating");
}

function fetchyamldata(policystatus) {
  dataTable.innerHTML = "";
  // document.querySelectorAll('.side-tab')[0].classList.add('active')
  // document.querySelectorAll('.side-tab')[1].classList.remove('active')
  // document.querySelectorAll('.side-tab')[2].classList.remove('active')

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
function getDatafromtabs(sideTabName,mainTab) {
  const searchInput = (document.getElementById("searchPolicy").value = "");
  var mainTabName = document
  .querySelector(".tab.active")
  .getAttribute("data-table");
  if(mainTab === 'incubating') {
    mainTabName = "incubating"
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
  } else if (mainTabName === "enforced") {
    let finalData = data.enforced;
    let enfocedData = prepareFinalData(finalData);
    renderEnforceTable(enfocedData, sideTabName);
  } else {
  console.log("incubating data",incubatingData)
    renderTableForBugging(incubatingData, sideTabName);
  }

//   renderTableForBugging(incubatingData, sideTabName);
}

function prepareFinalData(finalData) {
  metaDataArray = [];
  for (var i = 0; i < finalData.length; i++) {
    //  let namespaces = policyMetaData.find(o => o.names[0] === finalData[i].namespace);
    let namespaces = policyMetaData.policies.find(
      (o) => o.names[0] === finalData[i].namespace
    );
    namespaces.exceptions = finalData[i].exceptions;
    if (namespaces) {
      metaDataArray.push(namespaces);
    }
  }
  return metaDataArray;
}

// Function to render the table based on selected category
function renderTableForBugging(data, sideTabName) {
  dataTable.innerHTML = "";
  if (
    sideTabName !== "checkov" &&
    sideTabName !== "docker" &&
    sideTabName !== "helm"
  )
    return; // Only render for specified tabs
  filteredData = data.filter((item) => item.names[0].includes(sideTabName));
  policiesCount = filteredData.length;
  const table = document.createElement("table");
  table.innerHTML = "";
  const headerRow = table.insertRow();
  headerRow.innerHTML = `
        <th>Serial</th>
        <th>Policy Name</th>
        <th>Id</th>
        <th>Description</th>
        <th>Priority</th>
        <th>Level Of Effort</th>
        <th>Category</th>
        <th>Resource</th>
        <th>Standard Mapping</th>
        <th>Support Page</th>
        <th>Vulnarability Category</th>
        <th>Tags</th>
    `;
  filteredData.forEach((item, index) => {
    const row = table.insertRow();
    row.innerHTML = `
             <td>${index + 1}</td>
            <td>${item.names[0]}</td>
            <td>${item.id}</td>
            <td>${item.description}</td>
            <td>${item.priority}</td>
            <td>${item.levelOfEffort}</td>
             <td>${item.category}</td>
            <td>${item.resource}</td>
            <td>${item.standardMapping} || ''</td>
            <td>${item.supportPage}</td>
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
    filteredData = data.filter((item) => item.names[0].includes(sideTabName));
    searchData = data.filter((item) => item.names[0].includes(sideTabName));
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
        <th>Id</th>
        <th>Description</th>
        <th>Priority</th>
        <th>Level Of Effort</th>
        <th>Category</th>
        <th>Resource</th>
        <th>Standard Mapping</th>
        <th>Support Page</th>
        <th>Vulnarability Category</th>
        <th>Tags</th>
        <th>Exceptions</th>

    `;
  filteredData.forEach((item, index) => {
    var exceptions;
    if (item.exceptions) {
      exceptions = item.exceptions.map(function (item) {
        return item["service"];
      });
    } else {
      exceptions = "";
    }

    const row = table.insertRow();
    row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.names[0]}</td>
            <td>${item.id}</td>
            <td>${item.description}</td>
            <td>${item.priority}</td>
            <td>${item.levelOfEffort}</td>
             <td>${item.category}</td>
            <td>${item.resource}</td>
            <td>${item.standardMapping}</td>
            <td>${item.supportPage}</td>
            <td>${item.vulnerabilityCategory}</td>
            <td>${item.tags}</td>
            <td>${exceptions}</td>
        `;
  });

  dataTable.appendChild(table);
  policiesCountEl.innerText = "Total Policies : " + policiesCount;
}

// function getIncubatingData() {
//   dataTable.innerHTML = "<h3 class='work-progress'>Work in progress</h3>";
//   policiesCountEl.innerText = " ";
// }

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
    renderTableForBugging(filteredData, sideTabName);
  } else if (tabName === "enforce") {
    var enforcedData = data.enforced
      .filter((item) => item.namespace.includes(sideTabName))
      .filter((item) => item.namespace.includes(sideTabName));
    var filteredData = enforcedData.filter((item) => {
      return Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchText)
      );
    });
    renderEnforceTable(filteredData, sideTabName);
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
