ymaps.ready(init);


let myBalloon = document.querySelector("#window_balloon"),
    addButton = document.querySelector("#button__add"),
    address = document.querySelector("#address"),
    inputName = document.querySelector("#input__name"),
    inputPlace = document.querySelector("#input__place"),
    comments = document.querySelector("#comments"),
    inputText = document.querySelector("#input__text"),
    placemarks = [];
console.log(myBalloon, addButton, address, inputName, inputPlace, comments, inputText);

function init() {
    let myPlacemark,
        myMap = new ymaps.Map("map", {
            center: [54.51, 36.26],
            zoom: 12
        });

    // Создание кластера.
    let clusterer = new ymaps.Clusterer({
        preset: "islands#invertedNightClusterIcons",
        groupByCoordinates: false,
        clusterDisableClickZoom: true,
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false,
        clusterOpenBalloonOnClick: true,
        clusterBalloonContentLayout: "cluster#balloonCarousel",
        clusterBalloonPanelMaxMapArea: 0,
        clusterBalloonContentLayoutWidth: 200,
        clusterBalloonContentLayoutHeight: 250,
        clusterBalloonPagerSize: 10,
        clusterBalloonPagerType: "marker",
    });

    clusterer.add(placemarks);
    myMap.geoObjects.add(clusterer);

    function renderBalloonData(adr = "ПУСТО", comment = "Отзывов пока нет...") {
        let balloonData = `
        <div id="window_balloon">
            <div id="window__header">
                <div id="address">${adr}</div>
            </div>
            <div id="comments">${comment}</div>
            <div id="form__wrap">
                <h3 id="form__header">Ваш отзыв</h3>
                <input type="text" id="input__name" class="input" placeholder="Ваше имя" autocomplete="off">
                <input type="text" id="input__place" class="input" placeholder="Укажите место" autocomplete="off">
                <textarea name="otziv" id="input__text" class="input" cols="30" rows="5"
                    placeholder="Оставьте отзыв" autocomplete="off"></textarea>
                <button id="button__add"><b>Добавить</b></button>
            </div>
        </div>`;

        return balloonData;
    }


    // Слушаем клик на карте.
    myMap.events.add("click", e => {
        coords = e.get("coords");
        //comments.innerHTML = "Отзывов пока нет...";

        // Балун откроется в точке «привязки» балуна — т. е. над меткой.
        myMap.balloon.open(coords, {
            //contentHeader: 
            contentBody: renderBalloonData(),
            // contentFooter: 'FOOTER',
            //hintContent: 'HINT'
        });

        getAddress(coords);
    });


    // Создание метки.


    // Определяем адрес по координатам (обратное геокодирование).
    function getAddress(coords) {
        ymaps.geocode(coords).then(function (res) {
            let firstGeoObject = res.geoObjects.get(0);

            myPlacemark.properties.set({
                // Формируем строку с данными об объекте.
                iconCaption: [
                    // Название населенного пункта или вышестоящее административно-территориальное образование.
                    firstGeoObject.getLocalities().length ?
                    firstGeoObject.getLocalities() :
                    firstGeoObject.getAdministrativeAreas(),
                    // Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
                    firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
                ],
                // В качестве контента балуна задаем строку с адресом объекта.
                balloonContent: firstGeoObject.getAddressLine()
            });
            // Записываем адресс обьекта в хедер окна.
            address.innerText = firstGeoObject.getAddressLine();
        });
    }

    addButton.addEventListener("click", () => {
        debugger;
        if (inputName.value && inputPlace.value && inputText.value) {
            // Получаем адрес отзыва.
            //let addressLink = address.innerText;

            // Формируем дату.
            let date = new Date(),
                year = date.getFullYear(),
                month = ((date.getMonth() + 1) < 10) ? `0${date.getMonth() + 1}` : date.getMonth() + 1,
                day = (date.getDate() < 10) ? `0${date.getDate()}` : date.getDate(),
                hours = (date.getHours() < 10) ? `0${date.getHours()}` : date.getHours(),
                minutes = (date.getMinutes() < 10) ? `0${date.getMinutes()}` : date.getMinutes(),
                seconds = (date.getSeconds() < 10) ? `0${date.getSeconds()}` : date.getSeconds(),
                currentTime = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;

            // Создаём метку.
            let newPlacemark = new ymaps.Placemark(
                coords, {
                    balloonContentHeader: inputPlace.value,
                    // balloonContentBody: `<a onclick="openBalloonFull()" class="balloon__address_link">${addressLink}</a><br><br>${inputText.value}<br><br>`,
                    balloonContentFooter: currentTime
                }, {
                    preset: "islands#nightDotIcon",
                    draggable: false,
                    openBalloonOnClick: false // Используем custom balloon.
                }
            );

            // Добавляем метку на карту, в кластер и массив placemarks.
            myMap.geoObjects.add(newPlacemark);
            clusterer.add(newPlacemark);
            placemarks.push(newPlacemark);

            // Обновляем содержимое нашего балуна
            if (comments.innerHTML === "Отзывов пока нет...") comments.innerHTML = "";
            newPlacemark.commentContent =
                `<div><span><b>${inputName.value}</b></span>
                 <span class="ligth">${inputPlace.value}</span>
                <span class="ligth">${currentTime}:</span><br>
                 <span>${inputText.value}</span></div><br>`;
            comments.innerHTML += newPlacemark.commentContent;
            newPlacemark.place = address.innerText;

            // debugger;
            // var sData = JSON.parse(sessionStorage.data) || [];
            // var sData = [{
            //     comments: newPlacemark.commentContent,
            //     address: newPlacemark.place || '',
            //     coords: coords || ''
            // }];
            // debugger;
            // let obj;

            // debugger;
            // obj = {
            //     comments: newPlacemark.commentContent,
            //     address: newPlacemark.place || '',
            //     coords: coords || ''
            // };
            // sData.push(obj);
            // sessionStorage.data = JSON.stringify(sData);

            // Очищаем инпуты.
            clearInputs();

            newPlacemark.events.add("click", () => {
                openBalloon();
                comments.innerHTML = newPlacemark.commentContent;
                address.innerText = newPlacemark.place;
            });
        } else {
            alert("Необходимо заполнить все поля!");
        }
    });
}

// closeButton.addEventListener("click", () => {
//     myBalloon.style.display = "none";
//     clearInputs();
// });

function clearInputs() {
    inputName.value = "";
    inputPlace.value = "";
    inputText.value = "";
}

// Наш кастомный балун.
function openBalloon() {
    myBalloon.style.top = event.clientY + "px";
    myBalloon.style.left = event.clientX + "px";
    myBalloon.style.display = "block";
    myPlacemark.balloon.open();

}

// Балун с контентом из placemarks.
function openBalloonFull() {
    address.innerText = "";
    comments.innerHTML = "";
    let addressLink = document.querySelector(".balloon__address_link");
    let allCarousel = document.querySelector(".ymaps-2-1-75-balloon__close-button");


    for (let i = 0; i < placemarks.length; i++) {
        if (addressLink.innerText === placemarks[i].place) {
            address.innerText = placemarks[i].place;
            comments.innerHTML += placemarks[i].commentContent;
        }
    }
    openBalloon();
    allCarousel.click();

    var myBalloon = document.querySelector("#window_balloon"),
        addButton = document.querySelector("#button__add"),
        address = document.querySelector("#address"),
        inputName = document.querySelector("#input__name"),
        inputPlace = document.querySelector("#input__place"),
        comments = document.querySelector("#comments"),
        inputText = document.querySelector("#input__text");

    console.log(myBalloon, addButton, address, inputName, inputPlace, comments, inputText, e.get("contentBody"));
}