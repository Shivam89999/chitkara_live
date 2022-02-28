//console.log("running");

function previewImage(ele) {
    //console.log("running ******* ", ele);
    var preview = document.querySelector("#preview");
    preview.innerHTML = "";
    var image = new Image();
    image.height = 250;
    image.src = ele.getAttribute("src");
    image.width = 200;
    preview.appendChild(image);
    //change opacity;
    document.querySelectorAll(".min-image").forEach((item) => {
        item.style.opacity = 0.4;
    });
    ele.style.opacity = 1;
}

async function add_all_images() {
    var all_images = document.querySelector("#all_images");
    all_images.innerHTML = "";
    var preview = document.querySelector("#preview");
    preview.innerHTML = "";
    if (!this.files) return;
    if (this.files && this.files.length > 8) {
        let ele = document.createElement("span");
        ele.innerHTML = "Too many selected max 8 allowed";
        ele.style.cssText = "color:red; padding:40px";
        all_images.appendChild(ele);
        return;
    }
    //to check type
    //here item is file
    if (this.files) {
        for (let item of this.files) {
            if (!/\.(jpe?g|png)$/i.test(item.name)) {
                let ele = document.createElement("span");
                ele.innerHTML = "only jpg jpeg or png are allowed";
                ele.style.cssText = "color:red; padding:40px";
                all_images.appendChild(ele);
                return;
            }
        }
    }

    if (this.files) {
        // [].forEach.call(this.files, readAndall_images);
        // //console.log("vnfv");
        // readAndall_images(this.files[0]);
        // setTimeout(function() {
        //     //console.log("jnvjfnvjfnvnf");
        //     previewImage(all_images.firstElementChild);
        // }, 400);
        for (let i = 0; i < this.files.length; i++) {
            readAndall_images(this.files[i], i);
        }
    }

    function readAndall_images(file, i) {
        var reader = new FileReader();
        reader.addEventListener("load", function() {
            var image = new Image();
            image.height = 35;
            image.title = file.name;
            image.src = this.result;
            image.width = 50;
            image.setAttribute("onclick", "previewImage(this)");
            image.classList.add("min-image");
            all_images.appendChild(image);
            if (i == 0) {
                previewImage(all_images.firstElementChild);
            }
            //console.log("Y ");
        });
        reader.readAsDataURL(file);
        //console.log("yes ");
    }
}

document
    .querySelector("#file-input")
    .addEventListener("change", add_all_images);