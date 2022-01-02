function changeImage() {
    var preview = document.querySelector("#preview");
    var errorDiv = document.querySelector("#error-div");
    preview.innerHTML = "";
    if (!this.files) return;
    if (!/\.(jpe?g|png)$/i.test(this.files[0].name)) {
        let ele = document.createElement("span");
        ele.innerHTML = "only jpg jpeg or png are allowed";
        ele.style.cssText = "color:red; padding:40px";
        errorDiv.appendChild(ele);
        return;
    }
    read(this.files[0]);

    function read(file) {
        var reader = new FileReader();
        reader.addEventListener("load", function() {
            var image = new Image();
            image.height = 100;
            image.title = file.name;
            image.src = this.result;
            image.width = 100;
            image.style.borderRadius = "50%";
            image.style.border = "2.5px solid rgb(128 120 102 / 33%)";
            preview.appendChild(image);
            console.log("Y ");
        });
        reader.readAsDataURL(file);
        console.log("yes ");
    }
}
document.querySelector("#file-input").addEventListener("change", changeImage);