/*=============== SHOW MENU ===============*/
const showMenu = (toggleId, navId) =>{
   const toggle = document.getElementById(toggleId),
         nav = document.getElementById(navId)

   toggle.addEventListener('click', () =>{
       // Add show-menu class to nav menu
       nav.classList.toggle('show-menu')
       // Add show-icon to show and hide menu icon
       toggle.classList.toggle('show-icon')
   })
}

showMenu('nav-toggle','nav-menu')

/*=============== SHOW DROPDOWN MENU ===============*/
const dropdownItems = document.querySelectorAll('.dropdown__item')

// 1. Select each dropdown item
dropdownItems.forEach((item) =>{
    const dropdownButton = item.querySelector('.dropdown__button') 

    // 2. Select each button click
    dropdownButton.addEventListener('click', () =>{
        // 7. Select the current show-dropdown class
        const showDropdown = document.querySelector('.show-dropdown')
        
        // 5. Call the toggleItem function
        toggleItem(item)

        // 8. Remove the show-dropdown class from other items
        if(showDropdown && showDropdown!== item){
            toggleItem(showDropdown)
        }
    })
})

// 3. Create a function to display the dropdown
const toggleItem = (item) =>{
    // 3.1. Select each dropdown content
    const dropdownContainer = item.querySelector('.dropdown__container')

    // 6. If the same item contains the show-dropdown class, remove
    if(item.classList.contains('show-dropdown')){
        dropdownContainer.removeAttribute('style')
        item.classList.remove('show-dropdown')
    } else{
        // 4. Add the maximum height to the dropdown content and add the show-dropdown class
        dropdownContainer.style.height = dropdownContainer.scrollHeight + 'px'
        item.classList.add('show-dropdown')
    }
}

/*=============== DELETE DROPDOWN STYLES ===============*/
const mediaQuery = matchMedia('(min-width: 1118px)'),
      dropdownContainer = document.querySelectorAll('.dropdown__container')

// Function to remove dropdown styles in mobile mode when browser resizes
const removeStyle = () =>{
    // Validate if the media query reaches 1118px
    if(mediaQuery.matches){
        // Remove the dropdown container height style
        dropdownContainer.forEach((e) =>{
            e.removeAttribute('style')
        })

        // Remove the show-dropdown class from dropdown item
        dropdownItems.forEach((e) =>{
            e.classList.remove('show-dropdown')
        })
    }
}

addEventListener('resize', removeStyle)

/*=============== API ACCESS STATISTICS ===============*/

$(document).ready(function() {
    // Combined AJAX requests
    const endpoints = [
      { url: "https://explorer.fact0rn.io/ext/getsummary", id: "GET_DIFFICULTY", property: "difficulty" },
      { url: "https://explorer.fact0rn.io/ext/getsummary", id: "GET_BLOCKCOUNT", property: "blockcount" },
      { url: "https://explorer.fact0rn.io/ext/getsummary", id: "GET_CONNECTIONCOUNT", property: "connections" },
      { url: "https://explorer.fact0rn.io/ext/getsummary", id: "GET_MONEYSUPPLY_CIRC", property: "supply" },
      { url: "https://explorer.fact0rn.io/ext/getsummary", id: "GET_MONEYSUPPLY_TOTAL", property: "supply" },
      { url: "https://explorer.fact0rn.io/ext/getsummary", id: "HASHRATE", property: "hashrate" },
      { url: "https://explorer.fact0rn.io/ext/getsummary", id: "PRICE", property: "lastPrice" }
    ];
  
    // Create a single error handler to avoid redundancy and improve maintainability
    const handleError = (endpoint, jqXHR, textStatus, errorThrown) => {
      console.error(`Error fetching data from ${endpoint.url}:`, textStatus, errorThrown);
      $(`#${endpoint.id}`).text("Error: Could not fetch data.");
    };
  
    // Use Promise.all to handle multiple AJAX requests concurrently and improve performance
    Promise.all(endpoints.map(endpoint =>
      $.ajax({
        url: endpoint.url,
        method: "GET",
        dataType: "json"
      })
      .then(data => {
        const value = data[endpoint.property];
        if (value) {
          $(`#${endpoint.id}`).text(value);
        } else {
          console.warn(`Warning: Property "${endpoint.property}" not found in response for ${endpoint.url}`);
        }
      })
      .catch(error => handleError(endpoint, error.jqXHR, error.textStatus, error.errorThrown))
    ))
    .catch(error => console.error("Error handling AJAX requests:", error));
  });
  
/*=============== API AJAX ACCESS WALLET BALANCE ===============*/
$(document).ready(function () {
    // Function to perform the calculation
    function calculateDonatedAmount(balance, marketLastPrice) {
      return (balance * marketLastPrice).toFixed(2);
    }
  
    // Function to update the progress bar
    function updateProgressBar(progressBarId, percentageElemId, donatedAmountElemId, valueInDollars, goal) {
      const donatedPercentage = (valueInDollars / goal) * 100;
  
      const progressBar = $(`#${progressBarId}`);
      progressBar.find('.progress-bar-inner').css('width', `${donatedPercentage > 100 ? 100 : donatedPercentage}%`);
  
      $(`#${percentageElemId}`).text(`${Math.floor(donatedPercentage)}% - `);
      $(`#${donatedAmountElemId}`).text(`${valueInDollars} $ / ${goal} $`);
    }
  
    // Fetch initial wallet balance from Wallet1
    $.ajax({
      url: 'https://explorer.fact0rn.io/ext/getbalance/fact1qm3nvrxdj0v8v0ecchjprvkt72tja3fvj6vu2hm',
      cache: false,
      success: function (balanceHtml) {
        const initialWalletBalance = parseFloat(balanceHtml);
  
        // Fetch market last price
        $.ajax({
          url: 'https://xeggex.com/market/FACT_USDT',
          method: 'GET',
          success: function (data) {
            // Extract the market last price using jQuery
            const marketLastPriceText = $(data).find('span.marketlastprice').text();
            const marketLastPrice = parseFloat(marketLastPriceText).toFixed(2);
  
            // Update progress bar for Wallet1
            updateProgressBar('PROGRESSBAR_WALLET1', 'PERCENTAGE_WALLET1', 'DONATED_AMOUNT_WALLET1', calculateDonatedAmount(initialWalletBalance, marketLastPrice), 50000);
  
            // Make the third AJAX request to get the wallet balance for Wallet2
            $.ajax({
              url: 'https://apilist.tronscanapi.com/api/account/wallet?address=TSeMpubcvgaQtxZJyaUjKVjEVRK9CqxwJW&asset_type=1',
              method: 'GET',
              success: function (data) {
                const balance = parseFloat(data.data[1].balance);
                const goalBalance3 = 50000;
                $('#Wallet-Balance3').text(balance.toFixed(2));
  
                // Update progress bar for Wallet2
                updateProgressBar('PROGRESSBAR_WALLET2', 'PERCENTAGE_WALLET2', 'DONATED_AMOUNT_WALLET2', calculateDonatedAmount(balance, 1), goalBalance3, 'USDT');
              },
              error: function (xhr, status, error) {
                console.error('AJAX request for WALLET2 failed:', status, error);
              }
            });

            $.ajax({
                url: 'https://api.etherscan.io/api?module=account&action=balance&address=0x58f30F0CD525D5C50b70cF84AE8a000C6c6c9cf2&tag=latest',
                method: 'GET',
                success: function (data) {
                  const balance = parseFloat(data.result);
                  const goalBalance3 = 50000;
                  $('#Wallet-Balance3').text(balance.toFixed(2));
              
                  // Update progress bar for WALLET3
                  updateProgressBar('PROGRESSBAR_WALLET3', 'PERCENTAGE_WALLET3', 'DONATED_AMOUNT_WALLET3', calculateDonatedAmount(balance, 1), goalBalance3, 'USDT');
                },
                error: function (xhr, status, error) {
                  console.error('AJAX request for WALLET3 failed:', status, error);
                }
              });
          },
          error: function (xhr, status, error) {
            console.error('AJAX request for market last price failed:', status, error);
          }
        });
      },
      error: function (xhr, status, error) {
        console.error('AJAX request for WALLET2 failed:', status, error);
      }
    });
  });
