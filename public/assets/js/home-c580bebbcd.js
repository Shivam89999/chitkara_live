function handleAlertDisplay(){console.log("running ^^^^^^^^^^^ &&&&&&& "),$(".alert").each((e,l)=>{let t=$(l).attr("id");console.log("id is ",t),cookies[t]&&(console.log("not display ^^^^^^^^^^^ "),$(l).remove())}),0==$("#alerts").children().length&&$("#alerts").remove()}console.log("Home script running"),handleAlertDisplay();var noOfVisibleAlerts=document.querySelectorAll(".alert").length;function disappearAlert(e){console.log("id is ",e),document.getElementById(e).style.display="none",--noOfVisibleAlerts;let l=new Date;l.setTime(l.getTime()+864e5),document.cookie=e+"="+e+"; expires="+l.toUTCString()+";",0===noOfVisibleAlerts&&(document.getElementById("alerts").style.display="none")}