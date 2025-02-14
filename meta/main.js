let data = [];
let commits = [];  

async function loadData() {
    try {
        data = await d3.csv('./loc.csv', (row) => ({
            ...row,
            line: Number(row.line),
            depth: Number(row.depth),
            length: Number(row.length),
            date: new Date(row.date + 'T00:00' + row.timezone),
            datetime: new Date(row.datetime),
        }));
        
        await displayStats();
        console.log('Data loaded:', data.length, 'rows');
    } catch (error) {
        console.error('Error loading data:', error);
        document.querySelector('#stats').innerHTML = 'Error loading statistics';
    }
}

function displayStats() {
    // Process commits first
    processCommits();
    
    // Calculate additional stats
    const fileLengths = d3.rollups(
        data,
        (v) => d3.max(v, (v) => v.line),
        (d) => d.file
    );
    const totalCommits = commits.length;
    const averageFileLength = d3.mean(fileLengths, (d) => d[1]);
    
    // Add average line length calculation
    const averageLineLength = d3.mean(data, d => d.length);

    const workByPeriod = d3.rollups(
        data,
        (v) => v.length,
        (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
    );

    const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
    
    // Add stats to the display
    if (totalCommits)
        {
            dl.append('dt').text('Commits:');
            dl.append('dd').text(totalCommits);
        }
    if (averageFileLength) {
        dl.append('dt').text('Average file length:');
        dl.append('dd').text(Math.round(averageFileLength));
    }
    
    if (averageLineLength) {
        dl.append('dt').text('Average line length:');
        dl.append('dd').text(Math.round(averageLineLength) + ' characters');
    }
    
    if (maxPeriod) {
        dl.append('dt').text('Most active time:');
        dl.append('dd').text(maxPeriod);
    }
}



  function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: 'https://github.com/TimothyMao/portfolio/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
          value: lines,
          configurable: false,
          writable: false,
          enumerable: false
          // What other options do we need to set?
          // Hint: look up configurable, writable, and enumerable
        });
  
        return ret;
      });
  }


  function createScatterPlot(){
  const width = 1000;
  const height = 600;

  const svg = d3
  .select('#chart')
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .style('overflow', 'visible');

  const xScale = d3
  .scaleTime()
  .domain(d3.extent(commits, (d) => d.datetime))
  .range([0, width])
  .nice();

  const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  const dots = svg.append('g').attr('class', 'dots');

  dots
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .on('mouseenter', (event, commit) => {
        updateTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
      })
      .on('mouseleave', () => {
        updateTooltipContent({});
        updateTooltipVisibility(false);
      });

  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };
  
  // Update scales with new ranges
  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
  .axisLeft(yScale)
  .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');
// Add gridlines BEFORE the axes
const gridlines = svg
  .append('g')
  .attr('class', 'gridlines')
  .attr('transform', `translate(${usableArea.left}, 0)`);

// Create gridlines as an axis with no labels and full-width ticks
gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
// Add X axis
svg
  .append('g')
  .attr('transform', `translate(0, ${usableArea.bottom})`)
  .call(xAxis);

// Add Y axis
svg
  .append('g')
  .attr('transform', `translate(${usableArea.left}, 0)`)
  .call(yAxis);  
  }

  function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');
    if (Object.keys(commit).length === 0) return;
  
    if (Object.keys(commit).length === 0) return;

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
        dateStyle: 'full'
    });
    time.textContent = commit.datetime?.toLocaleTimeString();
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
}
  

  document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    createScatterPlot();
});

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
  }

  function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }