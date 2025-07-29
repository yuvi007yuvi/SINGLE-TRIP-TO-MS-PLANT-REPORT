document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('report-body');

    const zonalWards = {
        'Bharat Circle': ['Ward 01', 'Ward 03', 'Ward 11', 'Ward 15', 'Ward 16', 'Ward 20', 'Ward 30', 'Ward 31', 'Ward 33', 'Ward 37', 'Ward 44', 'Ward 47', 'Ward 48', 'Ward 54', 'Ward 59', 'Ward 68'],
        'Nishant Circle': ['Ward 06', 'Ward 10', 'Ward 23', 'Ward 27', 'Ward 28', 'Ward 29', 'Ward 32', 'Ward 38', 'Ward 41', 'Ward 52', 'Ward 57', 'Ward 63'],
        'Rahul Circle': ['Ward 02', 'Ward 04', 'Ward 05', 'Ward 07', 'Ward 14', 'Ward 18', 'Ward 19', 'Ward 26', 'Ward 35', 'Ward 49', 'Ward 53', 'Ward 61', 'Ward 64', 'Ward 65'],
        'Ranveer Circle': ['Ward 12', 'Ward 17', 'Ward 22', 'Ward 24', 'Ward 36', 'Ward 39', 'Ward 40', 'Ward 42', 'Ward 43', 'Ward 45', 'Ward 46', 'Ward 55', 'Ward 56', 'Ward 58', 'Ward 60']
    };

    document.getElementById('upload-csv-btn').addEventListener('click', () => {
        const fileInput = document.getElementById('csv-file-input');
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                const csvText = e.target.result;
                const rows = csvText.split('\n').map(row => row.trim()).filter(row => row.length > 0);
                const headers = rows[0].split(',');
                const dataRows = rows.slice(1);

                const allEntries = [];
                dataRows.forEach(row => {
                    // Hide the upload section after successful upload
                    document.getElementById('csv-upload-section').style.display = 'none';
                    const columns = row.split(',');
                    const entry = {
                        srNo: columns[0]?.trim() || '',
                        trip: columns[1]?.trim() || '',
                        location: columns[2]?.trim() || '',
                        zoneIncharge: columns[3]?.trim() || '',
                        supervisor: columns[4]?.trim() || '',
                        receiptNo: columns[5]?.trim() || '',
                        vehicleNo: columns[6]?.trim() || '',
                        vehicleType: columns[7]?.trim() || '',
                        driverName: columns[8]?.trim() || '',
                        partyName: columns[9]?.trim() || '',
                        ward: columns[10]?.trim() || '',
                        zone: columns[11]?.trim() || '',
                        wgtType: columns[12]?.trim() || '',
                        inTime: columns[13]?.trim() || '',
                        outTime: columns[14]?.trim() || '',
                        grossWGT: columns[15]?.trim() || '',
                        tareWGT: columns[16]?.trim() || '',
                        netWGT: columns[17]?.trim() || '',
                        receiptDate: columns[18]?.trim() || ''
                    };
                    allEntries.push(entry);
                });

                const vehicleTripCounts = {};
                allEntries.forEach(entry => {
                    if (vehicleTripCounts[entry.vehicleNo]) {
                        vehicleTripCounts[entry.vehicleNo]++;
                    } else {
                        vehicleTripCounts[entry.vehicleNo] = 1;
                    }
                });

                renderTable(allEntries, vehicleTripCounts);

                document.getElementById('circle-select').addEventListener('change', (event) => {
                    renderTable(allEntries, vehicleTripCounts, event.target.value);
                });

                // Helper function to format time to AM/PM
                function formatTime(timeString, entry) {
                    if (!timeString) return '';
                    const [hours, minutes] = timeString.split(':');
                    const formattedHours = String(hours).padStart(2, '0');
                    const formattedMinutes = String(minutes).padStart(2, '0');

                    return `${formattedHours}:${formattedMinutes}`;
                }

                function renderTable(data, counts, selectedCircle = 'all') {
                    document.getElementById('selected-circle-display').textContent = selectedCircle === 'all' ? 'All Wards' : selectedCircle;

                    const filteredEntries = data.filter(entry => {
                        const isWardVehicle = entry.location.toUpperCase().startsWith('WARD');
                        const hasSingleTrip = counts[entry.vehicleNo] === 1;

                        if (selectedCircle === 'all') {
                            return isWardVehicle && hasSingleTrip;
                        } else {
                            const wardNumber = entry.location.replace(/^(WARD)\s/i, 'Ward ');
                            return isWardVehicle && hasSingleTrip && zonalWards[selectedCircle].includes(wardNumber);
                        }
                    });

                    const zonalTablesContainer = document.getElementById('zonal-tables-container');
                    zonalTablesContainer.innerHTML = '';

                    const printButtonContainer = document.getElementById('print-button-container');
                    printButtonContainer.innerHTML = ''; // Clear existing button if any

                    const printButton = document.createElement('button');
                    printButton.id = 'print-button';
                    printButton.textContent = 'Print Report';
                    printButton.onclick = () => window.print();
                    printButtonContainer.appendChild(printButton);

                    for (const circle in zonalWards) {
                        const circleWards = zonalWards[circle];
                        const circleFilteredEntries = data.filter(entry => {
                            const isWardVehicle = entry.location.toUpperCase().startsWith('WARD');
                            const hasSingleTrip = counts[entry.vehicleNo] === 1;
                            const wardNumber = entry.location.replace(/^(WARD)\s/i, 'Ward ');
                            return isWardVehicle && hasSingleTrip && circleWards.includes(wardNumber);
                        });

                        const tableContainer = document.createElement('div');
                    tableContainer.classList.add('report-container'); // Re-add class for consistency, though not strictly used for display here
                    if (selectedCircle !== 'all' && circle !== selectedCircle) {
                        tableContainer.style.display = 'none';
                    }

                    tableContainer.innerHTML = `
                        <h2>${circle} Single Trip</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Sr. No.</th>
                                    <th>Trip</th>
                                    <th>Location</th>
                                    <th>Vehicle No.</th>
                                    <th>Vehicle Type</th>
                                    <th>Driver Name</th>
                                    <th>In Time</th>
                                    <th>Net WGT</th>
                                </tr>
                            </thead>
                            <tbody id="report-body-${circle.replace(/ /g, '-')}">
                            </tbody>
                        </table>
                    `;
                    zonalTablesContainer.appendChild(tableContainer);

                    const currentTableBody = document.getElementById(`report-body-${circle.replace(/ /g, '-')}`);


                    let srNo = 1;
                    circleFilteredEntries.forEach(entry => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${srNo++}</td>
                            <td>${entry.trip}</td>
                            <td>${entry.location}</td>
                            <td>${entry.vehicleNo}</td>
                            <td>${entry.vehicleType}</td>
                            <td>${entry.driverName}</td>
                            <td>${formatTime(entry.inTime, entry)}</td>
                            <td>${entry.netWGT}</td>
                        `;
                        currentTableBody.appendChild(tr);
                    });
                }

                    document.getElementById('total-single-trip-vehicles').textContent = filteredEntries.length;

                    for (const circle in zonalWards) {
                        const circleWards = zonalWards[circle];
                        const zonalFilteredEntries = data.filter(entry => {
                            const isWardVehicle = entry.location.toUpperCase().startsWith('WARD');
                            const hasSingleTrip = counts[entry.vehicleNo] === 1;
                            const wardNumber = entry.location.replace(/^(WARD)\s/i, 'Ward ');
                            return isWardVehicle && hasSingleTrip && circleWards.includes(wardNumber);
                        });

                        const elementId = circle.toLowerCase().replace(/ /g, '-') + '-total';
                        const element = document.getElementById(elementId);
                        if (element) {
                            element.textContent = zonalFilteredEntries.length;
                        }
                    }
                }
            };

            reader.readAsText(file);
        } else {
            alert('Please select a CSV file to upload.');
        }
    });
});
