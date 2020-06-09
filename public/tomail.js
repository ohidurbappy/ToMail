function sendToMail(f){
    var xmlhttp;

    if (window.XMLHttpRequest) {
        // code for modern browsers
        xmlhttp = new XMLHttpRequest();
     } else {
        // code for old IE browsers
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } 

    xmlhttp.onreadystatechange=function(){
        if (this.readyState == 4 && this.status == 200) {

            console.log(this.responseText);

            var result=JSON.parse(this.responseText);

            if (result['status']=='ok'){
                document.getElementById("tomailform").innerHTML = `
                <div><h2 style="color:#02a88d;font-size:32px;text-align:center;">Thank You</h2>
                <p style="color:#c1c1c1;text-align:center;">Your message have been received.!<br>
                I will reply you shortly.</p>
                </div>`;
            }else{
                document.getElementById("tomailform").innerHTML = `
                <div><h2 style="color:red;font-size:32px;text-align:center;">Sorry</h2>
                <p style="color:#c1c1c1;text-align:center;">Something went wrong.!<br>
                Message could not be sent.</p>
                </div>`;
            }
            
          }else{

            document.getElementById("tomailform").innerHTML = `
                <div><h2 style="color:blue;font-size:32px;text-align:center;">Please Wait...</h2>
                <p style="color:#c1c1c1;text-align:center;">While form is being submit</p>
                </div>`;

          }
    }

    var data=new FormData(f);
    xmlhttp.open("POST","https://to-mail.web.app/send",true)
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(f);
    console.log("Sending Request...")
    return false;

}