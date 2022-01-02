console.log("notice script running");

function previewNotice() {
    console.log("some ");
    var preview = document.getElementById("preview");
    var errorDiv = document.querySelector("#error-div");
    preview.innerText = "";
    console.log("this.files ", this.files);
    if (!this.files) return;
    console.log("this.files.name ", this.files[0].name);
    if (!/\.(pdf)$/i.test(this.files[0].name)) {
        let ele = document.createElement("span");
        ele.innerHTML = "only pdf allowed";
        ele.style.cssText = "color:red; padding:40px";
        errorDiv.appendChild(ele);
        return;
    }
    read(this.files[0]);

    function read(file) {
        var reader = new FileReader();
        reader.addEventListener("load", function() {
            var image = new Image();
            var p = document.createElement("p");
            image.height = 100;
            image.title = file.name;
            image.src = "https://cdn-icons-png.flaticon.com/512/136/136522.png";
            image.width = 75;
            p.innerText = file.name;
            preview.appendChild(image);
            preview.appendChild(p);
            console.log("Y ");
        });
        reader.readAsDataURL(file);
        console.log("yes ");
    }
}
document
    .querySelector("#select-file")
    .addEventListener("change", previewNotice);