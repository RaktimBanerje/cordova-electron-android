
//   function resizeImage(url, width, height, callback) {
//       var sourceImage = new Image();
//
//       sourceImage.onload = function() {
//           // Create a canvas with the desired dimensions
//           var canvas = document.createElement("canvas");
//           canvas.width = width;
//           canvas.height = height;
//
//           // Scale and draw the source image to the canvas
//           canvas.getContext("2d").drawImage(sourceImage, 0, 0, width, height);
//
//           // Convert the canvas to a data URL in PNG format
//           callback(canvas.toDataURL());
//       }
//
//       sourceImage.src = url;
//   }
//
//   // Usage
//   resizeImage('http://192.168.1.93/snap.jpeg', "400" , "300", function(dataUri) {
// $("#image").val(dataUri);
//   });


  //REQUIRES

  var $ = (jQuery = require("jquery"));
  const fs = require("fs-extra");
  var pjson = require("../package.json");
  const Realm = require("realm");
  const BSON = require("bson");

  const download = require('image-downloader');
  var dir = './galleryimages';

  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }

  function downloadImage(url, filepath) {
    fs.emptyDir('./galleryimages')
    .then(() => {
      console.log('Directory empty success!')
    })
    .catch(err => {
      console.error(err)
    })
    return download.image({
         url,
         dest: filepath
      });
  }


  //ON DOCUMENT READY
  $(document).ready(function () {
    getOrderListLength();
  });

  //INTERNET CHECK
  let isInternetConnected;
  internetCheckCallback();
  function internetCheckCallback() {
    checkInternet(function (isConnected) {
      if (isConnected) {
        $(".internet-status").css({ display: "none" });
        isInternetConnected = isConnected;
        console.log("connected");
      } else {
        $(".internet-status").css({ display: "block" });
        isInternetConnected = isConnected;
        console.log("not connected");
      }
    });
  }

  setInterval(() => {
    internetCheckCallback();
  }, 5000);

  function checkInternet(cb) {
    require("dns").lookup("google.com", function (err) {
      if (err && err.code == "ENOTFOUND") {
        cb(false);
      } else {
        cb(true);
      }
    });
  }

  //SLIDES INIT
  function initSlides() {
    startSlides();
    $(".loader-container").css({ display: "none" });
  }
  //SLIDESHOW
  function startSlides() {
    const directoryPath = "../../../galleryimages";
    var jsonString = localStorage.getItem("slider_data");
    obj = JSON.parse(jsonString);
    obj.forEach(function (arrayItem) {
      $("#bgContainer").append(
        `<div class="mySlides fade" data-delay="${arrayItem.slider_image_delays}000">
            <img src=${directoryPath}/${arrayItem.slider_image_urls} /></div>`
      );
    });
    console.log("imgs added");
    showSlides();
  }
  let slideIndex = 0;

  function showSlides() {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) {
      slideIndex = 1;
    }
    slides[slideIndex - 1].style.display = "block";
    var slidedelays = slides[slideIndex - 1].getAttribute("data-delay");
  //  console.log(slidedelays);
    setTimeout(showSlides, slidedelays);
  }


  function insertApiTodb() {

    const emailAddress = $("#email-login").val();
    const passwordDetails = $("#password-login").val();
    const keyvalue = emailAddress.substring(0, emailAddress.indexOf("@"));
    localStorage.setItem("login_email", emailAddress);
    localStorage.setItem("login_email", emailAddress);
    localStorage.setItem("login_db", keyvalue.split('+')[0]);
    localStorage.setItem("login_locid", keyvalue.split('+')[1]);
    localStorage.setItem("login_password", passwordDetails);
    setTimeout(() => {
  handleLogin();
  }, 4000);

  }
  var email = localStorage.getItem("login_email");

  if (!email) {
    document.getElementById("screen-overlay-transparent").style.display =
      "block";
    document.getElementById("cn-app-nolic-panel-container").style.display =
      "flex";
  } else {
    handleLogin();
  }

  async function handleLogin() {
    const apprealm = new Realm.App({ id: localStorage.getItem("login_db") });
    const {currentUser} = apprealm;
    const credentials = Realm.Credentials.emailPassword(localStorage.getItem("login_email"), localStorage.getItem("login_password"));
    try {
      const user = await apprealm.logIn(credentials);
          console.assert(user.id === apprealm.currentUser.id);
      console.log("Successfully logged in!", user.id);
      document.getElementById("screen-overlay-transparent").style.display =
        "none";
      document.getElementById("cn-app-nolic-panel-container").style.display =
        "none";

      return user;

      getOrderListLength();

    } catch (err) {
      document.getElementById("screen-overlay-transparent").style.display =
        "block";
      document.getElementById("cn-app-nolic-panel-container").style.display =
        "flex";
      console.error("Failed to log in", err.message);
    }
  }



  async function getOrderListLength() {
    const MDSSchema = {
      name: "menu_board_layouts",
      properties: {
        _id: "objectId",
        boardid: "string",
        slider_image_urls: "string",
        slider_image_delays: "string"
      },
      primaryKey: "_id",
    };

    const apprealm = new Realm.App({ id: localStorage.getItem("login_db") });
    const {currentUser} = apprealm;
        console.log(currentUser);
        const OpenRealmBehaviorConfiguration = {
          type: "openImmediately",
        };


    const realmmds = await Realm.open({
      schema: [MDSSchema],
      path: "menu_board_layouts.realm",
      sync: {
        user: currentUser,
        partitionValue: "",
        newRealmFileBehavior: OpenRealmBehaviorConfiguration,
        existingRealmFileBehavior: OpenRealmBehaviorConfiguration,
      },
    });

    var sear = "1";
    const mdsdata = realmmds.objects("menu_board_layouts");
    const mdsfildata = mdsdata.filtered('boardid == "' + sear + '"');
    console.log(`Number of MDS objects: ${mdsfildata.length}`);

    if (mdsfildata.length == 0){
      setTimeout(() => {
    handleLogin();
    }, 4000);

  }else{
    const mdsfilslidedata = mdsfildata;
    //alert(JSON.stringify(mdsfilslidedata));
    var a = [];
    var i,
      x = "";

    for (i in mdsfilslidedata) {
      a.push({
        slider_image_urls: `${mdsfilslidedata[i].slider_image_urls}`,
        slider_image_delays: `${mdsfilslidedata[i].slider_image_delays}`,
      });
    }
    console.log(JSON.stringify(a));
    localStorage.setItem("slider_data", JSON.stringify(a));

    mdsfildata.addListener(function (collection, changes) {
      console.log(changes.insertions);
      console.log(changes.modifications.length);
      console.log(changes.oldModifications);
      console.log(changes.newModifications.length);
      console.log(changes.deletions);

      if (changes.newModifications.length == "1") {
        getOrderListLength();
      }
      if (changes.newModifications.length == "0") {
        $(".mySlides").remove();
        $(".loader-container").css({ display: "block" });

        if (isInternetConnected) {
          let i;
          var getUrl = localStorage.getItem("slider_data");
          obj = JSON.parse(getUrl);
        //  alert(obj.length);
          for (i = 0; i < obj.length; i++) {
          //  alert();
            downloadImage('https://appdevnew.imreke.com.au/uploads/board/'+mdsfilslidedata[i].slider_image_urls, '../../galleryimages/'+mdsfilslidedata[i].slider_image_urls)
                .then(console.log)
                .catch(console.error);
          }
          if (i == obj.length){
            console.log("slides_downloaded");
            localStorage.setItem("slides_downloaded", true);
            setTimeout(() => {
              initSlides();
            }, 10000);
          }
        } else {
          initSlides();
        }
      }
    });
  }
}

