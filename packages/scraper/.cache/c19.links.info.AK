<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <title>Alaska COVID-19 Vaccination Clinics | Sign up for a COVID Vaccine in 2021</title>
    <meta name="author" content="Ben Matheson">
    <meta content="Schedule your COVID-19 vaccination appointment in Alaska. Vaccine supply is limited, but as more supplies become available, more people can recieve a COVID-19 vaccine." />


<!-- #### -->


<meta property="og:title" content="Find a COVID-19 Vaccination in Alaska | Sign up for a COVID Vaccine appointment in Alaska">
<meta property="og:type" content="website">
<meta property="og:url" content="anchoragecovidvaccine.org">
<meta property="og:image" content="https://s3-us-west-2.amazonaws.com/anchoragecovidvaccine.org/images/vaccine.png">
<meta name="og:description" content="Schedule your COVID-19 vaccination appointment in Alaska. Vaccine supply is currently limited, but as more supplies become available, more people can recieve a COVID-19 vaccine.">




<meta property="twitter:card" content="summary_large_image">

<meta property="twitter:title" content="Schedule a COVID-19 Vaccination in Alaska | Sign up for a COVID Vaccine appointment in Alaska">



<!-- ##### -->




    <!-- Bootstrap core CSS -->
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">

    <link href="css/bootstrap.min.css" rel="stylesheet">
    <link href="css/dataTables.bootstrap.css" rel="stylesheet">
    <link href="css/custom.css" rel="stylesheet">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script type="text/javascript" src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script type="text/javascript" src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){ (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o), m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m) })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
     ga('create', 'UA-8048387-10', 'auto'); ga('send', 'pageview');
    </script>
  
  </head>

  <body>
    <div class="container-fluid">

      <h1>󠁵󠁳Alaska <span class="underline">COVID-19 Vaccine</span>  Available Appointments</h1>
      <p class="description top"><strong>Important:</strong> There is currently a very limited supply of vaccine. Learn about <a href="http://dhss.alaska.gov/dph/Epi/id/Pages/COVID-19/VaccineAvailability.aspx" > current eligibility criteria</a> and take an <a href="https://hipaa.jotform.com/210366892090154"> eligibility quiz</a> to determine if you are currently eligible for a vaccination. </p>
      <!-- <p class="description top "><strong>Currently Eligibile:</strong>  <span class="attention" > Alaskans 65 years and above, frontline workers in health care settings, staff and residents in a long-term care setting, Alaskans who are age 50 and above and who have a high-risk medical condition OR work in an essential job around others, plus many education workers regardless of age, some COVID-19 response workers and anyone who lives or works in certain congregate settings. </span>  </p> -->
      <p class="description top "><strong>Currently Eligibile:</strong>  <span class="attention" > Alaskans 65 years and above, age 50 years and above with a high-risk medical condition, age 50 years and above working as an essential worker within 6 feet of others, preK–12 and child care education staff, most healthcare workers, people living or working in congregate settings, and long-term care residents and staff.
         </span>  </p>

     
     <div class="update">


      <p id="vaccines_available" class="updateItems"></p>

      <p id="refresh" class="description smaller updateItems"> </p>
      <button class ="remake updateItems"  onclick="remake_table()"><span class="emoji">🔄</span> Refresh</button>

</div>
      <!-- <p>Display any CSV file as a searchable, filterable, pretty HTML table. Done in 100% JavaScript. <a href='https://github.com/derekeder/csv-to-html-table'>Code on GitHub</a>.</p> -->
      <div id='table-container'  ></div>


      <!-- <div class="box_shadow"  > -->

        
     
      <p class="description"> <strong>How to use this page:</strong> The table shows a snapshot of the available appointments for published clinics on the Alaska DHSS Prepmod portal. The table is sortable: click on the appts column to sort by the number of appointments available. There a search bar on the left side of the page. <strong>This does not include all providers.</strong> See the DHSS <a href="http://dhss.alaska.gov/dph/Epi/id/Pages/COVID-19/vaccineappointments.aspx" target="_blank"> 'Find a COVID-19 Vaccine Provider' page </a> for more providers.  </p>
        
      <p class="description"> <strong>Data source:</strong>  The vaccine clinic information is sourced from the Alaska DHSS <a href='https://myhealth.alaska.gov/clinic/search' target="_blank">PrepMod</a>. The information refreshes every minute and the exact number of appointments may be different depending on how quickly people sign up for the appointments. You will need to refresh the page to bring in new data. </p>
      <p class="description"><strong>Need Help? </strong> More options to get support are available, including over the phone. You can call  <a href="tel:19076463322">1-907-646-3322</a>. </p>
      <!-- <p display="inline" class="description"> <strong>General Vaccine Questions?</strong> You can email  <strong>covid19vaccine@alaska.gov</strong> or call <strong>1-907-646-3322</strong>.</p> -->

      <p display="inline" class="description"> <strong>About:</strong> This page is a collaboration between the <a href="https://medium.com/anchorage-i-team/about-us-574f8ac4d839">Muncipality of Anchorage's Innovation Team</a>, the <a href = "http://dhss.alaska.gov/Pages/default.aspx" target="_blank">Alaska Department of Health and Social Services</a>, and the <a href="https://oit.alaska.gov/" target="_blank">Office of Information Technology</a>. You can find the code behind this project on <a href="https://github.com/MunicipalityOfAnchorage/prepmod-scrape" target="_blank">Github.</a> <strong>Questions about this website?</strong> Email ben.matheson@anchorageak.gov</p>
  <img height="60px" display="inline"   src="images/iteam_small.png">
<!-- </div> -->

    </div><!-- /.container -->

    <!-- <footer class='footer'>
       <div class='container-fluid'>
        <hr />
    <p class='pull-right'>This table is powered by <a href='https://github.com/derekeder/csv-to-html-table'>CSV to HTML Table</a> by <a href='http://derekeder.com'>Derek Eder</a></p> -->
      <!-- </div>
    </footer>  -->


    <!-- Bootstrap core JavaScript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script type="text/javascript" src="js/jquery.min.js"></script>
    <script type="text/javascript" src="js/bootstrap.min.js"></script>
    <script type="text/javascript" src="js/jquery.csv.min.js"></script>
    <script type="text/javascript" src="js/jquery.dataTables.min.js"></script>
    <script type="text/javascript" src="js/dataTables.bootstrap.js"></script>
    <script type="text/javascript" src="js/csv_to_html_table.js"></script>
    <script type="text/javascript" src="data/time_updated.js"></script>
    <script type="text/javascript" src="data/total_appointments.js"></script>


    <script type="text/javascript">
      function format_link(link){
        if (link)
          return "<a href='" + link + "' target='_blank'>" + link + "</a>";
        else
          return "";
      }

      function format_link_correct(link){
        if (link)
          return link;
        else
          return "";
      }


      CsvToHtmlTable.init({
        // csv_path: 'data/complete_prepmod_working.csv',
        csv_path: 'data/complete_prepmod_format.csv',
        element: 'table-container', 
        allow_download: true,
        escape: false,
        csv_options: {separator: ',', delimiter: '"'},
        datatables_options: {"paging": false,
      "order": [0, "asc"],   
       "language": {
      "emptyTable": "There are currently no available appointments in Prepmod and the vaccine supply is very limited. Check back soon."
    }},
        custom_formatting: [[1, format_link_correct]]
        

      });


function remake_table() {
  console.log('REMONIGD TABLE');

  location.reload()

  // CsvToHtmlTable.init({
  //       // csv_path: 'data/complete_prepmod_working.csv',
  //       csv_path: 'data/complete_prepmod_format.csv',
  //       element: 'table-container', 
  //       allow_download: true,
  //       escape: false,
  //       csv_options: {separator: ',', delimiter: '"'},
  //       datatables_options: {"paging": false,
  //     "order": [3, "desc"],   
  //      "language": {
  //     "emptyTable": "There are currently no available appointments in Prepmod and the vaccine supply is very limited. Check back soon."
  //   }},
  //       custom_formatting: [[1, format_link_correct]]
        

  //     });


  //     if (time_updated) {


  //   document.getElementById("refresh").innerHTML = "This page was last refreshed: <span id='time_updated_element'>  </span> "
  //   document.getElementById("time_updated_element").innerHTML = `<strong>${time_updated}</strong>`
  //   console.log("REMIGN UPDING THE TIME")

  // } else {console.log('INSIDE REMAKEno time')}
}




    </script>


<script type="text/javascript">
  // console.log('tiem updated');
  // console.log(time_updated);
  
  // var vaccines_available = 999;
  // console.log();
  if (time_updated) {
    document.getElementById("refresh").innerHTML = "Update: &nbsp;  <span id='time_updated_element'>  </span> "

    // document.getElementById("available").innerHTML = "Last updated: <span id='time_updated_element'>  </span> "
    document.getElementById("time_updated_element").innerHTML = `<strong>${time_updated}</strong>`




fetch("data/total_appointments.js")
    .then(d=> d.json())
    .then(function(d){

      document.getElementById("vaccines_available").innerHTML = `  <span class="totalDescription"> <strong>Total:</strong></span> <span class="available"><strong>${d}</strong></span> `


    })


  } else {console.log('no time')}
  
  </script>

  </body>
</html>
