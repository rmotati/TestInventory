// Inventory.js

var _table_ = document.createElement('table'),
_tr_ = document.createElement('tr'),
_th_ = document.createElement('th'),
_td_ = document.createElement('td');
const dataTable = document.getElementById('dataTable');
dataTable.innerHTML = '';
var data;
// var tableName = "checkov"
fetchyamldata('bugging.yaml')


function getDatafromtabs(tableName) {
    var sidetabname = document.querySelector('.side-tab.active').getAttribute('data-table');
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {        
            tabs.forEach(tab => tab.classList.remove('active'));
            this.classList.add('active');
        });
    });
    if(sidetabname === 'bugging') {
        renderTableForBugging(data, tableName); 
    }
    else if( sidetabname === 'enforce')  {
        renderEnforceTable(data.enforced,tableName)
    }
    else {
        renderEnforceTable(data.unenforced,tableName)
    }
    
}

function fetchyamldata(policystatus) {
    dataTable.innerHTML = '';
    document.querySelectorAll('.tab')[0].classList.add('active')
    document.querySelectorAll('.tab')[1].classList.remove('active')
    document.querySelectorAll('.tab')[2].classList.remove('active')

      const tabs = document.querySelectorAll('.side-tab');
      tabs.forEach(tab => {
          tab.addEventListener('click', function () {        
              tabs.forEach(tab => tab.classList.remove('active'));
              this.classList.add('active');
          });
        })
    if (policystatus) {


        // Fetch and process the YAML data
        fetch(policystatus)
            .then(response => response.text())
            .then(text => {
              data = jsyaml.load(text);
                    getDatafromtabs("checkov")
               
            })
            .catch(error => console.error('Error loading YAML file:', error));
    }
}

// Function to render the table based on selected category
function renderTableForBugging(data, tableName) {
    dataTable.innerHTML = "";
    if (tableName !== 'checkov' && tableName !== 'docker' && tableName !== 'helm') return; // Only render for specified tabs
    const filteredData = data.bugging.filter(item => item.namespace.includes(tableName));
    const table = document.createElement('table');
    table.innerHTML = ""
    const headerRow = table.insertRow();
    headerRow.innerHTML = `
        <th>Serial</th>
        <th>Namespace</th>
        <th>Priority</th>
        <th>Support Page</th>
        <th>Vulnerability Category</th>
    `;
    filteredData.forEach((item, index) => {
        const row = table.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.namespace}</td>
            <td>${item.priority}</td>
            <td><a href="${item.supportPage}" target="_blank">${item.supportPage}</a></td>
            <td>${item.vulnerabilityCategory}</td>
        `;
    });

    dataTable.appendChild(table);
}


function renderEnforceTable(data, tableName) {
    dataTable.innerHTML = "";
    if(tableName === "checkov") {
        var filteredData = data.filter(item => item.namespace.includes(tableName));
    }
    else {
        var filteredData = data.filter(item => item.namespace.includes(`release.${tableName}`));
    }

    const table = document.createElement('table');
    const headerRow = table.insertRow();
    headerRow.innerHTML = `
        <th>Serial</th>
        <th>Namespace</th>
        <th>Exceptions</th>

    `;
    filteredData.forEach((item, index) => {
        var exceptions;
        if(item.exceptions) {
            exceptions = item.exceptions.map(function (item) {
                return item['service'];
            });
        }
        else {
            exceptions = "";
        }
      
        const row = table.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.namespace}</td>
            <td>${exceptions}</td>
        `;
    });

    dataTable.appendChild(table);
}
  
// Function to handle clicking on Git icon
document.getElementById('git-icon').addEventListener('click', function () {
    window.open('https://git.soma.salesforce.com/opa/falcon-policies', '_blank');
});

// Function to handle clicking on Slack icon
document.getElementById('slack-icon').addEventListener('click', function () {
    window.open('https://salesforce-internal.slack.com/archives/C0299NZBQKF', '_blank');
});
