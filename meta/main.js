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

// Add this line at the end of the file
document.addEventListener('DOMContentLoaded', loadData);

  function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: 'https://github.com/vis-society/lab-7/commit/' + commit,
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

