// Here we are initiating and defining our variables globally that will be used and consumed in the whole script.

let dataStorage = {};
const dropdownSelector = d3.select('#selectDropdown');
const informationPanel = d3.select('#sampleMetadata');


// populating the panel and the information together.
const populateInfoPanel = (idx)  => {
    const filteredMetaData = dataStorage.metadata.filter((i) => i['id'] == idx);
    informationPanel.html('');
    Object.entries(filteredMetaData[0]).forEach(([key, val]) => {
        const keyForTitle = convertCaseOfTitle(key);
        informationPanel.append('h6').text(`${keyForTitle}: ${val}`);
    });
};


// Sorting the objects in ascending or descending order
const SortTheObjects = (key, order = 'asc') => {
    return function sort(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
            return 0;
        }
        const x = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
        const y = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];
        let comparer = 0;
        if (x > y) {
            comparer = 1;
        } else if (x < y) {
            comparer = -1;
        }
        return order === 'desc' ? comparer * -1 : comparer;
    };
};



// This functions Converts all our keys to the Title Case
const convertCaseOfTitle = (string) =>
    string.toLowerCase()
        .split(' ')
        .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
        .join(' ');


// Plotting the Bubble chart
const BubbleCharPlotting = (idx) => {
    const allSamplesData = dataStorage['samples'].filter((i) => i['id'] == idx);
    const data = {
        x: allSamplesData[0].otu_ids,
        y: allSamplesData[0].sample_values,
        mode: 'markers',
        text: allSamplesData[0].otu_labels,
        marker: {
            color: allSamplesData[0].otu_ids,
            size: allSamplesData[0].sample_values,
            colorscale: 'Jet',
        },
    };

    const Data = [data];
    const overallLayout = {
        showlegend: false,
        height: 598,
        width: 1199,
        xaxis: { title: 'OTU IDS' },
    };
    const initConfig = {
        displayModeBar: false,
    };
    Plotly.newPlot('bubbleChart', Data, overallLayout, initConfig);
};


// Plotting the Bar chart
const BarChartPlotting = (idx) => {
    const allSamplesData = dataStorage['samples'].filter((i) => i['id'] == idx);
    const sampleValues = allSamplesData[0].sample_values;
    const otuIds = allSamplesData[0].otu_ids;
    const otuLabels = allSamplesData[0].otu_labels;

    let combinedList = [];
    for (let i = 0; i < sampleValues.length; i++) {
        const otuId = otuIds[i];
        const otuText = `OTU ${otuId.toString()}`;
        const combinedObject = {
            sample_values: sampleValues[i],
            otu_ids: otuText,
            otu_labels: otuLabels[i],
        };
        combinedList.push(combinedObject);
    }

    const sortArray = combinedList.sort(SortTheObjects('sample_values', 'desc'));
    const sortedData = sortArray.slice(0, 10);

    const sampleValuesList = sortedData.map((i) => i.sample_values).reverse();
    const otu_id_array = sortedData.map((i) => i.otu_ids).reverse();
    const otu_label_array = sortedData.map((i) => i.otu_labels).reverse();

    const data = {
        type: 'bar',
        y: otu_id_array,
        x: sampleValuesList,
        text: otu_label_array,
        orientation: 'h',
    };

    const Data = [data];
    const overallLayout = {
        width: 973,
        height: 502,
    };
    const initConfig = {
        displayModeBar: false,
    };
    Plotly.newPlot('barChart', Data, overallLayout, initConfig);
};


// Init function to construct all the data from the samples.json file.
const initialize = () => {
    d3.json(
        'https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json'
    ).then(function (json) {
        dataStorage = json;
        const names = dataStorage.names;

        names.forEach((i) => {
            dropdownSelector
                .append('option')
                .text(i)
                .property('value', i);
        });

        const firstID = names[0];

        populateInfoPanel(firstID);
        BarChartPlotting(firstID);
        BubbleCharPlotting(firstID);

        document.getElementById("loaderDiv").style.display = "none";
        document.getElementById("selectDropdownContainer").style.display = "block";
        document.getElementById("demographicContainer").style.display = "block";
    });
};

initialize();

const onDropdownChange = (index)  => {
    populateInfoPanel(index);
    BarChartPlotting(index);
    BubbleCharPlotting(index);
};