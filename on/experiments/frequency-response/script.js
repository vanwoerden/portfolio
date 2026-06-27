// Audio Frequency Response Curve Visualization
class FrequencyResponseChart {
    constructor() {
        this.margin = { top: 10, right: 20, bottom: 40, left: 60 };
        this.updateDimensions();
        
        // Frequency range (log scale)
        this.freqMin = 10;
        this.freqMax = 20000;
        
        // dBSPL range (linear scale) - adjusted for CSV data range
        this.dbMin = 60;
        this.dbMax = 90;
        
        // Configuration object
        this.config = {
            // Display settings
            showMeasurements: true,
            showAverage: true,
            showReference: true,
            showIndividualMeasurements: new Array(22).fill(true),
            optimizationMode: 'before', // 'before' or 'after'
            
            // Visual settings
            measurementColor: '#3d82cf',
            averageColor: '#ff785f',
            referenceColor: '#44444B',
            measurementStrokeWidth: 1.5,
            averageStrokeWidth: 2,
            referenceStrokeWidth: 2,
            
            // Chart settings
            curveType: 'basis',
            measurementOpacity: 0.25,
            averageOpacity: 1,
            referenceOpacity: 1,
            blendMode: 'lighten'
        };
        
        // Load configuration from localStorage
        this.loadConfig();
        
        // Load CSV data and generate measurements
        this.loadCSVData();
    }
    
    loadCSVData() {
        // Embedded CSV data to avoid CORS issues
        const csvData = `frequency,dB
10,73
12,80.5
16,80
20,81
22,80
24,78.5
26,80
28,81
30,80
35,79
40,78
42,82
47,87.5
56,87
60,84
65,82
75,82.5
80,82
84,87
105,85
130,84
140,74
160,81
170,79
180,83
220,82
260,83
270,80
280,79
320,81.5
390,81
415,83
450,74
480,71
520,73
550,70
580,76
600,74
640,73
680,74
720,67
750,77
780,74
820,75
870,73
920,78
960,80
1100,76
1150,80
1240,75
1300,76
1370,75
1440,78
1510,77
1580,78
1650,75
1720,79
1790,77
1860,78
1930,77
2200,78
2300,75
2400,79
2500,76
2600,78
2800,76
2860,78
3000,76
3100,79
3600,75
4000,77
4200,76
4400,78
4600,79
5200,76
5300,77
5600,75
5900,79
6200,75
6400,78
6700,77
7100,78
7300,77
7500,78
8200,77
8800,78
9250,77
9770,79
10290,77
10810,77.5
13000,79
13500,78
14500,76
15000,78
15500,78
16500,76
16800,78
17000,74
18000,79
18500,75
18800,79
19500,74
20000,75`;

        console.log("Using embedded CSV data");
        
        // Parse CSV data
        const baseData = this.parseCSV(csvData);
        
        // Verify the first data point is correct
        if (baseData.length > 0) {
            const firstPoint = baseData[0];
            console.log("Verifying first data point:", firstPoint);
            if (firstPoint.frequency === 10 && firstPoint.dbSPL === 73) {
                console.log("✅ CSV data verified - first point is 10Hz, 73dB");
            } else {
                console.log("❌ CSV data verification failed - expected 10Hz, 73dB but got", firstPoint);
            }
        }
        
        // Store the base data for the reference curve
        this.baseData = baseData;
        
        // Generate 22 measurements with variations
        this.measurements = this.generateMeasurementsFromBase(baseData);
        this.averageCurve = this.calculateAverage();
        
        // Debug: Log data to console
        console.log("Loaded base data points:", baseData.length);
        console.log("Base data sample:", baseData.slice(0, 3));
        console.log("Base data dB range:", Math.min(...baseData.map(d => d.dbSPL)), "to", Math.max(...baseData.map(d => d.dbSPL)));
        console.log("Base data freq range:", Math.min(...baseData.map(d => d.frequency)), "to", Math.max(...baseData.map(d => d.frequency)));
        console.log("Chart dB range:", this.dbMin, "to", this.dbMax);
        console.log("Chart freq range:", this.freqMin, "to", this.freqMax);
        console.log("Generated measurements:", this.measurements.length);
        console.log("First measurement sample:", this.measurements[0].slice(0, 3));
        console.log("Average curve sample:", this.averageCurve.slice(0, 3));
        
        // Initialize chart
        this.initChart();
        this.setupControls();
        this.setupResizeHandler();
        this.generateIndividualCheckboxes();
        this.initializeColorPreviews();
        this.applyConfigToUI();
    }
    
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const data = [];
        
        console.log("CSV text first few lines:", lines.slice(0, 5));
        
        for (let i = 1; i < lines.length; i++) { // Skip header
            const [frequency, dbValue] = lines[i].split(',');
            const parsedData = {
                frequency: parseFloat(frequency),
                dbSPL: parseFloat(dbValue)
            };
            data.push(parsedData);
            
            // Log first few data points for debugging
            if (i <= 5) {
                console.log(`Data point ${i}:`, parsedData);
            }
        }
        
        console.log("Parsed CSV data total points:", data.length);
        console.log("First data point:", data[0]);
        console.log("Last data point:", data[data.length - 1]);
        return data;
    }
    
    generateMeasurementsFromBase(baseData) {
        const measurements = [];
        
        for (let i = 0; i < 22; i++) {
            const measurement = baseData.map(point => {
                // Add moderate variations (±2.5 dB max) around the base data
                const variation = (Math.random() - 0.5) * 5; // -2.5 to +2.5 dB
                const newDbSPL = Math.max(this.dbMin, Math.min(this.dbMax, point.dbSPL + variation));
                
                return {
                    frequency: point.frequency,
                    dbSPL: newDbSPL
                };
            });
            measurements.push(measurement);
        }
        
        return measurements;
    }
    
    updateDimensions() {
        const container = document.querySelector('.chart-container');
        const containerRect = container.getBoundingClientRect();
        
        // Ensure exact width on mobile
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            this.width = 343; // Full 343px width on mobile
            this.height = 120;
        } else {
            this.width = containerRect.width;
            this.height = containerRect.height;
        }
        
        // Optimize margins for mobile to use full width
        if (isMobile) {
            // Adequate left margin for Y-axis, reduced bottom margin since no x-axis label
            this.margin = { top: 10, right: 4, bottom: 20, left: 25 };
        } else {
            // Reduced margins on desktop for more chart space
            this.margin = { top: 10, right: 15, bottom: 40, left: 40 };
        }
        
        this.innerWidth = this.width - this.margin.left - this.margin.right;
        this.innerHeight = this.height - this.margin.top - this.margin.bottom;
    }
    
    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.updateDimensions();
            this.updateChart();
        });
    }
    
    updateChart() {
        // Update scales
        this.xScale.range([0, this.innerWidth]);
        this.yScale.range([this.innerHeight, 0]);
        
        // Update SVG size
        this.svg
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("viewBox", `0 0 ${this.width} ${this.height}`);
        
        // Update main group transform
        this.g.attr("transform", `translate(${this.margin.left},${this.margin.top})`);
        
        // Update axes
        this.g.select(".x-axis")
            .attr("transform", `translate(0,${this.innerHeight})`)
            .call(d3.axisBottom(this.xScale)
                .tickValues([10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000])
                .tickFormat(d3.format("~s"))
            )
            .style("font-size", "10px")
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("fill", "#babac3");
        
        this.g.select(".y-axis")
            .call(d3.axisLeft(this.yScale)
                .tickValues(d3.range(this.dbMin, this.dbMax + 5, 10))
                .tickFormat(d => `${d}`)
            )
            .style("font-size", "10px")
            .selectAll("text")
            .style("fill", "#babac3");
        
        // Update axis lines and ticks
        this.g.selectAll(".domain")
            .style("stroke", "#44444b");
        this.g.selectAll(".tick line")
            .style("stroke", "#44444b");
        
        // Update axis labels
        this.g.select(".y-label")
            .attr("y", 0 - this.margin.left)
            .attr("x", 0 - (this.innerHeight / 2));
        
        this.g.select(".x-label")
            .attr("transform", `translate(${this.innerWidth / 2}, ${this.innerHeight + 20})`);
        
        // Update line generator
        this.line = d3.line()
            .x(d => this.xScale(d.frequency))
            .y(d => this.yScale(d.dbSPL))
            .curve(d3.curveBasis);
        
        // Update all curves
        this.curvesGroup.selectAll(".measurement-curve")
            .attr("d", d => this.line(d));
        
        this.g.select(".average-curve")
            .attr("d", this.line(this.averageCurve));
        
        // Update gridlines
        this.updateGridlines();
    }
    
    generateSampleData() {
        const measurements = [];
        const numPoints = 50; // Points per curve
        const frequencies = d3.range(numPoints).map(i => 
            this.freqMin * Math.pow(this.freqMax / this.freqMin, i / (numPoints - 1))
        );
        
        // Generate 22 different frequency response curves
        for (let i = 0; i < 22; i++) {
            const curve = frequencies.map(freq => {
                // Create realistic frequency response variations
                const baseResponse = 70 + Math.sin(Math.log(freq) * 2) * 5;
                const roomResonance = Math.sin(Math.log(freq) * 3) * 3;
                const measurementNoise = (Math.random() - 0.5) * 4;
                const individualVariation = Math.sin(freq / 1000 + i) * 2;
                
                return {
                    frequency: freq,
                    dbSPL: Math.max(this.dbMin, Math.min(this.dbMax, 
                        baseResponse + roomResonance + measurementNoise + individualVariation
                    ))
                };
            });
            measurements.push(curve);
        }
        
        return measurements;
    }
    
    calculateAverage() {
        const frequencies = this.measurements[0].map(d => d.frequency);
        return frequencies.map(freq => {
            const values = this.measurements.map(curve => 
                curve.find(d => d.frequency === freq).dbSPL
            );
            const average = values.reduce((sum, val) => sum + val, 0) / values.length;
            return { frequency: freq, dbSPL: average };
        });
    }
    
    initChart() {
        // Create SVG
        this.svg = d3.select("#chart")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("viewBox", `0 0 ${this.width} ${this.height}`)
            .attr("preserveAspectRatio", "none");
        
        // Create main group
        this.g = this.svg.append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
        
        // Create scales
        this.xScale = d3.scaleLog()
            .domain([this.freqMin, this.freqMax])
            .range([0, this.innerWidth]);
        
        this.yScale = d3.scaleLinear()
            .domain([this.dbMin, this.dbMax])
            .range([this.innerHeight, 0]);
        
        // Create line generator
        this.line = d3.line()
            .x(d => this.xScale(d.frequency))
            .y(d => this.yScale(d.dbSPL))
            .curve(d3.curveBasis);
        
        // Draw axes
        this.drawAxes();
        
        // Draw curves
        this.drawCurves();
    }
    
    drawAxes() {
        // Determine if mobile based on width
        const isMobile = this.width <= 400;
        
        // X-axis (frequency) - different tick values for mobile vs desktop
        const xTickValues = isMobile ? 
            [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000] :
            [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 20000];
        
        this.g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${this.innerHeight})`)
            .call(d3.axisBottom(this.xScale)
                .tickValues(xTickValues)
                .tickFormat(d => {
                    if (d === 20000) {
                        return isMobile ? "20k Hz" : "20000 Hz";
                    }
                    return d3.format("~s")(d);
                })
            )
            .style("font-size", "10px")
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("fill", "#babac3")
            .style("font-family", "Rigton, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");
        
        // Y-axis (dBSPL) - different tick values for mobile vs desktop
        const yTickValues = isMobile ? 
            d3.range(this.dbMin, this.dbMax + 1, 5) : // Every 5dB on mobile
            d3.range(this.dbMin, this.dbMax + 1, 1);  // Every 1dB on desktop
        
        this.g.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(this.yScale)
                .tickValues(yTickValues)
                .tickFormat(d => isMobile ? (d % 10 === 0 ? `${d}` : "") : (d % 5 === 0 ? `${d}` : ""))
            )
            .style("font-size", "10px")
            .selectAll("text")
            .style("fill", "#babac3")
            .style("font-family", "Rigton, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif")
            .style("text-anchor", "end")
            .attr("dx", "-2");
        
        // Style axis lines and ticks
        this.g.selectAll(".domain")
            .style("stroke", "#44444b");
        this.g.selectAll(".tick line")
            .style("stroke", "#44444b");
        
        // Add gridlines
        this.drawGridlines();
        
        // Axis labels
        if (!isMobile) {
            this.g.append("text")
                .attr("class", "x-label")
                .attr("transform", `translate(${this.innerWidth / 2}, ${this.innerHeight + 30})`)
                .style("text-anchor", "middle")
                .style("font-size", "11px")
                .style("fill", "#babac3")
                .style("font-family", "Rigton, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif")
                .text("Frequency (Hz)");
        }
    }
    
    drawGridlines() {
        // Determine if mobile based on width
        const isMobile = this.width <= 400;
        
        // Create gridlines groups
        this.gridlinesGroup = this.g.append("g")
            .attr("class", "gridlines");
        
        if (isMobile) {
            // Mobile: Only 5dB gridlines for Y-axis
            const yTicks5dB = d3.range(this.dbMin, this.dbMax + 1, 5);
            this.gridlinesGroup.selectAll(".y-gridline-5db")
                .data(yTicks5dB)
                .enter().append("line")
                .attr("class", "y-gridline-5db")
                .attr("x1", 0)
                .attr("x2", this.innerWidth)
                .attr("y1", d => this.yScale(d))
                .attr("y2", d => this.yScale(d))
                .style("stroke", "#44444B")
                .style("stroke-width", 0.5)
                .style("opacity", 1);
            
            // Mobile: Reduced X-axis gridlines
            const xTicksMobile = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
            this.gridlinesGroup.selectAll(".x-gridline")
                .data(xTicksMobile)
                .enter().append("line")
                .attr("class", "x-gridline")
                .attr("x1", d => this.xScale(d))
                .attr("x2", d => this.xScale(d))
                .attr("y1", 0)
                .attr("y2", this.innerHeight)
                .style("stroke", "#44444B")
                .style("stroke-width", 0.3)
                .style("opacity", 1);
        } else {
            // Desktop: Full gridlines
            // Y-axis gridlines - every 1dB increment (#44444B)
            const yTicks1dB = d3.range(this.dbMin, this.dbMax + 1, 1);
            this.gridlinesGroup.selectAll(".y-gridline-1db")
                .data(yTicks1dB)
                .enter().append("line")
                .attr("class", "y-gridline-1db")
                .attr("x1", 0)
                .attr("x2", this.innerWidth)
                .attr("y1", d => this.yScale(d))
                .attr("y2", d => this.yScale(d))
                .style("stroke", "#44444B")
                .style("stroke-width", 0.3)
                .style("opacity", 1);
            
            // Y-axis gridlines - every 5dB increment (#44444B)
            const yTicks5dB = d3.range(this.dbMin, this.dbMax + 1, 5);
            this.gridlinesGroup.selectAll(".y-gridline-5db")
                .data(yTicks5dB)
                .enter().append("line")
                .attr("class", "y-gridline-5db")
                .attr("x1", 0)
                .attr("x2", this.innerWidth)
                .attr("y1", d => this.yScale(d))
                .attr("y2", d => this.yScale(d))
                .style("stroke", "#44444B")
                .style("stroke-width", 0.5)
                .style("opacity", 1);
            
            // X-axis gridlines - all frequencies (#44444B)
            const xTicksAll = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 20000];
            this.gridlinesGroup.selectAll(".x-gridline")
                .data(xTicksAll)
                .enter().append("line")
                .attr("class", "x-gridline")
                .attr("x1", d => this.xScale(d))
                .attr("x2", d => this.xScale(d))
                .attr("y1", 0)
                .attr("y2", this.innerHeight)
                .style("stroke", "#44444B")
                .style("stroke-width", 0.3)
                .style("opacity", 1);
        }
    }
    
    updateGridlines() {
        if (!this.gridlinesGroup) return;
        
        // Determine if mobile based on width
        const isMobile = this.width <= 400;
        
        if (isMobile) {
            // Mobile: Update only 5dB Y-axis gridlines
            const yTicks5dB = d3.range(this.dbMin, this.dbMax + 1, 5);
            this.gridlinesGroup.selectAll(".y-gridline-5db")
                .data(yTicks5dB)
                .attr("x2", this.innerWidth)
                .attr("y1", d => this.yScale(d))
                .attr("y2", d => this.yScale(d));
            
            // Mobile: Update reduced X-axis gridlines
            const xTicksMobile = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
            this.gridlinesGroup.selectAll(".x-gridline")
                .data(xTicksMobile)
                .attr("x1", d => this.xScale(d))
                .attr("x2", d => this.xScale(d))
                .attr("y2", this.innerHeight);
        } else {
            // Desktop: Update all gridlines
            // Update Y-axis gridlines - 1dB increments
            const yTicks1dB = d3.range(this.dbMin, this.dbMax + 1, 1);
            this.gridlinesGroup.selectAll(".y-gridline-1db")
                .data(yTicks1dB)
                .attr("x2", this.innerWidth)
                .attr("y1", d => this.yScale(d))
                .attr("y2", d => this.yScale(d));
            
            // Update Y-axis gridlines - 5dB increments
            const yTicks5dB = d3.range(this.dbMin, this.dbMax + 1, 5);
            this.gridlinesGroup.selectAll(".y-gridline-5db")
                .data(yTicks5dB)
                .attr("x2", this.innerWidth)
                .attr("y1", d => this.yScale(d))
                .attr("y2", d => this.yScale(d));
            
            // Update X-axis gridlines - all frequencies
            const xTicksAll = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 20000];
            this.gridlinesGroup.selectAll(".x-gridline")
                .data(xTicksAll)
                .attr("x1", d => this.xScale(d))
                .attr("x2", d => this.xScale(d))
                .attr("y2", this.innerHeight);
        }
    }
    
    drawCurves() {
        console.log("Drawing curves...");
        console.log("Base data available:", !!this.baseData);
        console.log("Measurements available:", !!this.measurements);
        console.log("Average curve available:", !!this.averageCurve);
        
        // Create group for curves with blend mode
        this.curvesGroup = this.g.append("g")
            .style("mix-blend-mode", "lighten");
        
        // Draw individual measurement curves
        this.curvesGroup.selectAll(".measurement-curve")
            .data(this.measurements)
            .enter().append("path")
            .attr("class", "measurement-curve")
            .attr("id", (d, i) => `measurement-curve-${i}`)
            .attr("d", d => this.line(d))
            .style("fill", "none")
            .style("stroke", "#3d82cf")
            .style("stroke-width", 1.5)
            .style("opacity", 0.25);
        
        
        // Draw average curve
        if (this.averageCurve) {
            this.g.append("path")
                .attr("class", "average-curve")
                .attr("d", this.line(this.averageCurve))
                .style("fill", "none")
                .style("stroke", "#ff785f")
                .style("stroke-width", 2)
                .style("opacity", 1);
            console.log("Average curve drawn");
        } else {
            console.log("No average curve data available");
        }
        
        // Draw reference line (flattened average curve)
        if (this.averageCurve) {
            // Calculate the mean of the average curve
            const meanValue = d3.mean(this.averageCurve, d => d.dbSPL);
            
            // Create flattened version by reducing deviation from mean
            const referenceData = this.averageCurve.map(d => ({
                frequency: d.frequency,
                dbSPL: meanValue + (d.dbSPL - meanValue) * 0.3 // Reduce deviation to 30%
            }));
            
            this.g.append("path")
                .attr("class", "reference-curve")
                .attr("d", this.line(referenceData))
                .style("fill", "none")
                .style("stroke", "#44444B")
                .style("stroke-width", 2)
                .style("opacity", 1);
        }
        
    }
    
    updateCurveType(curveType) {
        const curveMap = {
            'basis': d3.curveBasis,
            'cardinal': d3.curveCardinal,
            'catmull-rom': d3.curveCatmullRom,
            'monotone': d3.curveMonotoneX,
            'step': d3.curveStep
        };
        
        this.line.curve(curveMap[curveType]);
        
        // Update all curves
        this.curvesGroup.selectAll(".measurement-curve")
            .transition()
            .duration(300)
            .attr("d", d => this.line(d));
        
        
        this.g.select(".average-curve")
            .transition()
            .duration(300)
            .attr("d", this.line(this.averageCurve));
    }
    
    updateTension(tension) {
        this.line.curve(d3.curveCardinal.tension(tension));
        
        // Update all curves
        this.curvesGroup.selectAll(".measurement-curve")
            .transition()
            .duration(300)
            .attr("d", d => this.line(d));
        
        
        this.g.select(".average-curve")
            .transition()
            .duration(300)
            .attr("d", this.line(this.averageCurve));
    }
    
    updateOpacity(opacity) {
        this.curvesGroup.selectAll(".measurement-curve")
            .transition()
            .duration(200)
            .style("opacity", opacity);
    }
    
    downloadSVG() {
        const svgData = new XMLSerializer().serializeToString(this.svg.node());
        const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
        const svgUrl = URL.createObjectURL(svgBlob);
        
        const downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = "frequency-response-curve.svg";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
    }
    
    setupControls() {
        // Curve type control
        d3.select("#curveType").on("change", (event) => {
            this.updateCurveType(event.target.value);
        });
        
        // Tension control
        d3.select("#tension").on("input", (event) => {
            this.updateTension(parseFloat(event.target.value));
        });
        
        // Opacity control
        d3.select("#opacity").on("input", (event) => {
            this.updateOpacity(parseFloat(event.target.value));
        });
        
        // Toggle measurements
        d3.select("#showMeasurements").on("change", (event) => {
            const show = event.target.checked;
            this.toggleAllMeasurements(show);
            this.updateConfig('showMeasurements', show);
        });
        
        // Toggle average
        d3.select("#showAverage").on("change", (event) => {
            const show = event.target.checked;
            this.toggleAverage(show);
            this.updateConfig('showAverage', show);
        });
        
        // Toggle reference line
        d3.select("#showReference").on("change", (event) => {
            const show = event.target.checked;
            this.toggleReference(show);
            this.updateConfig('showReference', show);
        });
        
        // Optimization mode control
        d3.select("#optimizationMode").on("change", (event) => {
            const mode = event.target.value;
            this.setOptimizationMode(mode);
            this.updateConfig('optimizationMode', mode);
        });
        
        
        // Stroke width controls
        d3.select("#measurementStrokeWidth").on("input", (event) => {
            const value = parseFloat(event.target.value);
            this.updateMeasurementStrokeWidth(value);
            d3.select("#measurementStrokeValue").text(value);
            this.updateConfig('measurementStrokeWidth', value);
        });
        
        d3.select("#averageStrokeWidth").on("input", (event) => {
            const value = parseFloat(event.target.value);
            this.updateAverageStrokeWidth(value);
            d3.select("#averageStrokeValue").text(value);
            this.updateConfig('averageStrokeWidth', value);
        });
        
        // Color picker controls
        d3.select("#measurementColor").on("input", (event) => {
            const color = event.target.value;
            this.updateMeasurementColor(color);
            d3.select("#measurementColorPreview").style("background-color", color);
            this.updateConfig('measurementColor', color);
        });
        
        d3.select("#averageColor").on("input", (event) => {
            const color = event.target.value;
            this.updateAverageColor(color);
            d3.select("#averageColorPreview").style("background-color", color);
            this.updateConfig('averageColor', color);
        });
        
        // Download button
        d3.select("#downloadBtn").on("click", () => {
            this.downloadSVG();
        });
    }
    
    generateIndividualCheckboxes() {
        const grid = d3.select("#measurementGrid");
        
        // Clear existing content
        grid.selectAll("*").remove();
        
        // Generate individual checkboxes for each measurement
        const measurements = grid.selectAll(".measurement-item")
            .data(this.measurements)
            .enter()
            .append("div")
            .attr("class", "measurement-item");
        
        measurements.append("label")
            .attr("class", "checkbox-label")
            .each(function(d, i) {
                const label = d3.select(this);
                label.append("input")
                    .attr("type", "checkbox")
                    .attr("id", `measurement-${i}`)
                    .attr("checked", true)
                    .on("change", function() {
                        const isChecked = this.checked;
                        d3.select(`#measurement-curve-${i}`)
                            .style("opacity", isChecked ? 0.25 : 0);
                        
                        // Update configuration
                        this.config.showIndividualMeasurements[i] = isChecked;
                        this.updateConfig('showIndividualMeasurements', this.config.showIndividualMeasurements);
                    }.bind(this));
                
                label.append("span")
                    .attr("class", "checkmark");
                
                label.append("text")
                    .text(`M${i + 1}`);
            });
    }
    
    toggleAllMeasurements(show) {
        // Update all individual checkboxes
        this.config.showIndividualMeasurements.fill(show);
        d3.selectAll("#measurementGrid input[type='checkbox']")
            .property("checked", show);
        
        // Update all measurement curves
        this.curvesGroup.selectAll(".measurement-curve")
            .style("opacity", show ? 0.25 : 0);
        
        // Save configuration
        this.updateConfig('showIndividualMeasurements', this.config.showIndividualMeasurements);
    }
    
    toggleAverage(show) {
        this.g.select(".average-curve")
            .style("opacity", show ? 1 : 0);
    }
    
    toggleReference(show) {
        this.g.select(".reference-curve")
            .style("opacity", show ? 1 : 0);
    }
    
    setOptimizationMode(mode) {
        if (mode === 'before') {
            // Before optimization: show measurements, average, hide reference
            this.toggleAllMeasurements(true);
            this.toggleAverage(true);
            this.toggleReference(false);
            
            // Reset colors to original
            this.updateAverageColor('#ff785f');
            this.updateReferenceColor('#44444B');
        } else if (mode === 'after') {
            // After optimization: hide measurements, show average in gray, show reference in blue
            this.toggleAllMeasurements(false);
            this.toggleAverage(true);
            this.toggleReference(true);
            
            // Change colors
            this.updateAverageColor('#44444B');
            this.updateReferenceColor('#5cabff');
        }
    }
    
    
    updateMeasurementStrokeWidth(width) {
        this.curvesGroup.selectAll(".measurement-curve")
            .style("stroke-width", width);
    }
    
    updateAverageStrokeWidth(width) {
        this.g.select(".average-curve")
            .style("stroke-width", width);
    }
    
    updateMeasurementColor(color) {
        this.curvesGroup.selectAll(".measurement-curve")
            .style("stroke", color);
    }
    
    updateAverageColor(color) {
        this.g.select(".average-curve")
            .style("stroke", color);
    }
    
    updateReferenceColor(color) {
        this.g.select(".reference-curve")
            .style("stroke", color);
    }
    
    initializeColorPreviews() {
        // Initialize color previews with current values
        const measurementColor = d3.select("#measurementColor").property("value");
        const averageColor = d3.select("#averageColor").property("value");
        
        d3.select("#measurementColorPreview").style("background-color", measurementColor);
        d3.select("#averageColorPreview").style("background-color", averageColor);
    }
    
    // Configuration management methods
    saveConfig() {
        try {
            localStorage.setItem('frequencyResponseConfig', JSON.stringify(this.config));
            console.log('Configuration saved:', this.config);
        } catch (error) {
            console.warn('Could not save configuration to localStorage:', error);
        }
    }
    
    loadConfig() {
        try {
            const savedConfig = localStorage.getItem('frequencyResponseConfig');
            if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                // Merge with default config to handle new properties
                this.config = { ...this.config, ...parsedConfig };
                console.log('Configuration loaded:', this.config);
                return true;
            }
        } catch (error) {
            console.warn('Could not load configuration from localStorage:', error);
        }
        return false;
    }
    
    updateConfig(key, value) {
        this.config[key] = value;
        this.saveConfig();
    }
    
    applyConfigToUI() {
        // Apply configuration to UI controls
        d3.select("#showMeasurements").property("checked", this.config.showMeasurements);
        d3.select("#showAverage").property("checked", this.config.showAverage);
        d3.select("#showReference").property("checked", this.config.showReference);
        d3.select("#optimizationMode").property("value", this.config.optimizationMode);
        
        // Apply individual measurement checkboxes
        this.config.showIndividualMeasurements.forEach((isVisible, index) => {
            const checkbox = d3.select(`#measurement-${index}`);
            if (!checkbox.empty()) {
                checkbox.property("checked", isVisible);
            }
        });
        
        // Apply stroke widths
        d3.select("#measurementStrokeWidth").property("value", this.config.measurementStrokeWidth);
        d3.select("#measurementStrokeValue").text(this.config.measurementStrokeWidth);
        d3.select("#averageStrokeWidth").property("value", this.config.averageStrokeWidth);
        d3.select("#averageStrokeValue").text(this.config.averageStrokeWidth);
        
        // Apply colors
        d3.select("#measurementColor").property("value", this.config.measurementColor);
        d3.select("#averageColor").property("value", this.config.averageColor);
        d3.select("#measurementColorPreview").style("background-color", this.config.measurementColor);
        d3.select("#averageColorPreview").style("background-color", this.config.averageColor);
        
        // Apply visual settings to chart
        this.updateMeasurementColor(this.config.measurementColor);
        this.updateAverageColor(this.config.averageColor);
        this.updateMeasurementStrokeWidth(this.config.measurementStrokeWidth);
        this.updateAverageStrokeWidth(this.config.averageStrokeWidth);
        
        // Apply visibility settings
        this.toggleAllMeasurements(this.config.showMeasurements);
        this.toggleAverage(this.config.showAverage);
        this.toggleReference(this.config.showReference);
        
        // Apply optimization mode
        this.setOptimizationMode(this.config.optimizationMode);
    }
}

// Initialize the chart when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FrequencyResponseChart();
});
