// Inventory.js

var _table_ = document.createElement('table'),
_tr_ = document.createElement('tr'),
_th_ = document.createElement('th'),
_td_ = document.createElement('td');
const dataTable = document.getElementById('dataTable');
dataTable.innerHTML = '';
fetchyamldata({},'bugging.yaml')

function fetchyamldata(e,policystatus) {
    dataTable.innerHTML = '';


    if (document.querySelector('.side-tab.active') !== null) {
        document.querySelector('.side-tab.active').classList.remove('active');
      }
      e.className = "side-tab active";
    if (policystatus) {


        // Fetch and process the YAML data
        fetch(policystatus)
            .then(response => response.text())
            .then(text => {
                const data = jsyaml.load(text);
                const tabs = document.querySelectorAll('.tab');
                if (policystatus === "policies.yaml") {
                    dataTable.appendChild(buildHtmlTable(data.enforced));

                }
                else {
                    var tableName = "checkov"
                    tabs.forEach(tab => {
                        tab.addEventListener('click', function () {
                             tableName = this.getAttribute('data-table')
                        
                            tabs.forEach(tab => tab.classList.remove('active'));
                            this.classList.add('active');
                        });
                    });
                    renderTable(data, tableName); // Initially render Checkov tab
                }
               
            })
            .catch(error => console.error('Error loading YAML file:', error));
    }
}

// Function to render the table based on selected category
function renderTable(data, tableName) {
    console.log(data);
    if (tableName !== 'checkov' && tableName !== 'docker' && tableName !== 'helm') return; // Only render for specified tabs
    const filteredData = data.bugging.filter(item => item.namespace.includes(tableName));
    const table = document.createElement('table');
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

    // Builds the HTML Table out of myList json data from Ivy restful service.
    function buildHtmlTable(arr) {
        var table = _table_.cloneNode(false),
            columns = addAllColumnHeaders(arr, table);
        for (var i = 0, maxi = arr.length; i < maxi; ++i) {
            var tr = _tr_.cloneNode(false);
            for (var j = 0, maxj = columns.length; j < maxj; ++j) {
                var td = _td_.cloneNode(false);
                if (typeof (arr[i][columns[j]]) == "string") {
                    var cellValue = arr[i][columns[j]];
                    td.appendChild(document.createTextNode(cellValue));

                }
                else if (typeof (arr[i][columns[j]]) == "object") {
                    var names = arr[i][columns[j]].map(function (item) {
                        return item['service'];
                    });

                    const listContainer = document.createElement('ul');
                    listContainer.innerHTML = '';
                    for (let i = 0; i < names.length; i++) {
                        const listItem = document.createElement('li');

                        listItem.textContent = names[i];
                        listContainer.appendChild(listItem);
                    }
                    var cellValue = names
                    console.log(listContainer)
                    td.appendChild(listContainer);

                }
                else {
                    var cellValue = ""
                    td.appendChild(document.createTextNode(cellValue));

                }
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        return table;
    }

    // Adds a header row to the table and returns the set of columns.
    // Need to do union of keys from all records as some records may not contain
    // all records
    function addAllColumnHeaders(arr, table) {
        var columnSet = [],
            tr = _tr_.cloneNode(false);
        for (var i = 0, l = arr.length; i < l; i++) {
            for (var key in arr[i]) {
                if (arr[i].hasOwnProperty(key) && columnSet.indexOf(key) === -1) {

                    console.log("key", key)
                    columnSet.push(key);
                    var th = _th_.cloneNode(false);
                    th.appendChild(document.createTextNode(key));
                    tr.appendChild(th);
                }
            }
        }
        table.appendChild(tr);
        return columnSet;
    }
// Function to handle clicking on Git icon
document.getElementById('git-icon').addEventListener('click', function () {
    window.open('https://git.soma.salesforce.com/opa/falcon-policies', '_blank');
});

// Function to handle clicking on Slack icon
document.getElementById('slack-icon').addEventListener('click', function () {
    window.open('https://salesforce-internal.slack.com/archives/C0299NZBQKF', '_blank');
});