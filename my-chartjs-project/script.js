class PlayerPanel {
  /**
   * PlayerPanel constructor.
   * searchInputId - The ID of the search input element.
   * listId - The ID of the player list element.
   * buttonId - The ID of the display button element.
   * chartContainerId - The ID of the chart container element.
   * shootingChartContainerId - The ID of the shooting chart container element.
   * sumChartContainerId - The ID of the sum chart container element.
   * teamPercentageChartContainerId - The ID of the team percentage chart container element.
   * players - The array of player objects.
   */
  constructor(searchInputId, listId, buttonId, chartContainerId, 
      shootingChartContainerId, sumChartContainerId, teamPercentageChartContainerId,
      players) {
    // Assigning DOM elements to instance properties
    this.searchInput = document.getElementById(searchInputId);
    this.playerList = document.getElementById(listId);
    this.displayButton = document.getElementById(buttonId);
    this.chartContainer = document.getElementById(chartContainerId);
    this.shootingChartContainer = document.getElementById(shootingChartContainerId);
    this.sumChartContainer = document.getElementById(sumChartContainerId);
    this.teamPercentageChartContainer = document.getElementById(teamPercentageChartContainerId);

    this.players = players;
    this.selectedPlayers = [];

    // Call the method to bind event listeners
    this.bindEvents();
  }

  // Bind event listeners to relevant elements.
  bindEvents() {
    // Add event listener to the search input
    this.searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value;
      this.filterPlayers(searchTerm);
    });

    // Add event listener to the player list checkboxes
    this.playerList.addEventListener('change', (e) => {
      const selectedPlayer = e.target.value;
      const player = this.players.find((player) => player.PLAYER === selectedPlayer);

      if (player) {
        const isSelected = this.selectedPlayers.some((selectedPlayer) => selectedPlayer.PLAYER === player.PLAYER);

        if (e.target.checked && !isSelected) {
          this.selectedPlayers.push(player);
        } else if (!e.target.checked && isSelected) {
          const index = this.selectedPlayers.findIndex((selectedPlayer) => selectedPlayer.PLAYER === player.PLAYER);
          this.selectedPlayers.splice(index, 1);
        }

        this.filterPlayers(this.searchInput.value);
      }
    });

    // Add event listener to the display button
    this.displayButton.addEventListener('click', () => {
      this.displaySelectedPlayers();
      this.displayShootingChart();
      this.displayTeamPercentageChart();
    });
  }

  /**
   * Filter the players based on the search term.
   * searchTerm - The search term entered by the user.
   */
  filterPlayers(searchTerm) {
    const filteredPlayers = this.players.filter((player) =>
      player.PLAYER.toLowerCase().includes(searchTerm.toLowerCase())
    );

    this.updatePlayerList(filteredPlayers);
  }

  /**
   * Update the player list with the filtered players.
   * filteredPlayers - The array of filtered player objects.
   */
  updatePlayerList(filteredPlayers) {
    this.playerList.innerHTML = '';

    // Add selected players to the list
    this.selectedPlayers.forEach((player) => {
      this.playerList.appendChild(this.createPlayerListItem(player, true));
    });

    // Add filtered players to the list
    filteredPlayers.forEach((player) => {
      const isSelected = this.selectedPlayers.some((selectedPlayer) => selectedPlayer.PLAYER === player.PLAYER);

      if (!isSelected) {
        this.playerList.appendChild(this.createPlayerListItem(player, false));
      }
    });
  }

  /**
   * Create an HTML list item for a player.
   * player - The player object.
   * isChecked - Indicates whether the checkbox should be checked.
   */
  createPlayerListItem(player, isChecked) {
    const listItem = document.createElement('li');
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = player.PLAYER;
    checkbox.checked = isChecked;
    label.textContent = player.PLAYER;
    label.appendChild(checkbox);
    listItem.appendChild(label);

    return listItem;
  }

  // Display the selected players' data in a bar chart.
  displaySelectedPlayers() {
    // Calculate summed categories for selected players
    const summedCategories = {};
    this.selectedPlayers.forEach((player) => {
      for (const category in player) {
        if (
          category !== 'PLAYER' &&
          category !== 'POS' &&
          category !== 'TEAM' &&
          category !== 'GP' &&
          category !== 'MPG' &&
          category !== 'FG Volume' &&
          category !== 'FG Volume (Makes)' &&
          category !== 'FG Volume (Attempts)' &&
          category !== 'FT Volume' &&
          category !== 'FT Volume (Makes)' &&
          category !== 'FT Volume (Attempts)' &&
          category !== 'FT%' &&
          category !== 'FG%' &&
          category !== 'TOTAL'
        ) {
          if (!summedCategories[category]) {
            summedCategories[category] = player[category];
          } else {
            summedCategories[category] += player[category];
          }
        }
      }
    });

    // Create datasets for the bar chart
    const datasets = this.selectedPlayers.map((player, index) => {
      const playerData = [];
      for (const category in player) {
        if (
          category !== 'PLAYER' &&
          category !== 'POS' &&
          category !== 'TEAM' &&
          category !== 'GP' &&
          category !== 'MPG' &&
          category !== 'FG Volume' &&
          category !== 'FG Volume (Makes)' &&
          category !== 'FG Volume (Attempts)' &&
          category !== 'FT Volume' &&
          category !== 'FT Volume (Makes)' &&
          category !== 'FT Volume (Attempts)' &&
          category !== 'FT%' &&
          category !== 'FG%' &&
          category !== 'TOTAL'
        ) {
          playerData.push(player[category]);
        }
      }
      return {
        label: player.PLAYER,
        data: playerData,
        backgroundColor: `rgba(${this.getRandomColor()}, 0.5)`,
        borderColor: `rgba(${this.getRandomColor()}, 1)`,
        borderWidth: 1,
      };
    });

    // Create data object for the bar chart
    const data = {
      labels: Object.keys(summedCategories),
      datasets: datasets,
    };

    // Clear the chart container and create a new canvas
    this.chartContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    this.chartContainer.appendChild(canvas);

    // Render the bar chart
    new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Display the sum chart
    this.displaySumChart(summedCategories);
  }

  // Display the shooting statistics of the selected players in a bar chart.
  displayShootingChart() {
    // Define the shooting statistics categories
    const shootingStats = ['FG Volume (Makes)', 'FG Volume (Attempts)', 'FT Volume (Makes)', 'FT Volume (Attempts)'];

    // Create shooting data for the bar chart
    const shootingData = this.selectedPlayers.map((player) =>
      shootingStats.map((stat) => player[stat])
    );

    // Create datasets for the bar chart
    const datasets = this.selectedPlayers.map((player, index) => ({
      label: player.PLAYER,
      data: shootingData[index],
      backgroundColor: `rgba(${this.getRandomColor()}, 0.5)`,
      borderColor: `rgba(${this.getRandomColor()}, 1)`,
      borderWidth: 1,
    }));

    // Create data object for the bar chart
    const data = {
      labels: shootingStats,
      datasets: datasets,
    };

    // Clear the shooting chart container and create a new canvas
    this.shootingChartContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    this.shootingChartContainer.appendChild(canvas);

    // Render the bar chart
    new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  /**
   * Display the summed categories of all selected players in a bar chart.
   * summedCategories - The summed categories data.
   */
  displaySumChart(summedCategories) {
    // Create data object for the bar chart
    const data = {
      labels: Object.keys(summedCategories),
      datasets: [
        {
          label: 'Sum of Categories',
          data: Object.values(summedCategories),
          backgroundColor: 'rgba(0, 123, 255, 0.5)',
          borderColor: 'rgba(0, 123, 255, 1)',
          borderWidth: 1,
        },
      ],
    };

    // Clear the sum chart container and create a new canvas
    this.sumChartContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    this.sumChartContainer.appendChild(canvas);

    // Render the bar chart
    new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  // Display the team percentage chart for FG% and FT%.
  displayTeamPercentageChart() {
    // Calculate team shooting percentages
    const teamFGPercentage = this.calculateTeamPercentage('FG Volume (Makes)', 'FG Volume (Attempts)');
    const teamFTPercentage = this.calculateTeamPercentage('FT Volume (Makes)', 'FT Volume (Attempts)');

    // Create data object for the bar chart
    const data = {
      labels: ['Team FG%', 'Team FT%'],
      datasets: [
        {
          label: 'Team Percentage',
          data: [teamFGPercentage, teamFTPercentage],
          backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)'],
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
          borderWidth: 1,
        },
      ],
    };

    // Clear the team percentage chart container and create a new canvas
    this.teamPercentageChartContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    this.teamPercentageChartContainer.appendChild(canvas);

    // Render the bar chart
    new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }

  /**
   * Calculate the team shooting percentage.
   * makesCategory - The category for makes.
   * attemptsCategory - The category for attempts.
   */
  calculateTeamPercentage(makesCategory, attemptsCategory) {
    // Calculate the sum of makes and attempts for selected players
    const makesSum = this.selectedPlayers.reduce((total, player) => total + player[makesCategory], 0);
    const attemptsSum = this.selectedPlayers.reduce((total, player) => total + player[attemptsCategory], 0);

    // Calculate the shooting percentage
    const percentage = (makesSum / attemptsSum) * 100;

    return percentage.toFixed(2);
  }

  // Generate a random color.
  getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `${r},${g},${b}`;
  }
}

// Fetch player data from the JSON file
fetch('sortedPlayers.json')
  .then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to fetch player data: ' + response.status);
    }
  })
  .then((players) => {
    // Create PlayerPanel instances for different player panels
    new PlayerPanel(
      'playerSearch1',
      'playerList1',
      'displayButton1',
      'chartContainer1',
      'shootingChartContainer1',
      'sumChartContainer1',
      'teamPercentageChartContainer1',
      players
    );
    new PlayerPanel(
      'playerSearch2',
      'playerList2',
      'displayButton2',
      'chartContainer2',
      'shootingChartContainer2',
      'sumChartContainer2',
      'teamPercentageChartContainer2',
      players
    );
  })
  .catch((error) => {
    console.log('Error:', error);
  });

