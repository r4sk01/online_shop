
document.addEventListener('DOMContentLoaded', () => {

    const search = document.querySelector('.search');
    const cardBT = document.getElementById('cart');
    const wishlistBT = document.getElementById('wishlist');
    const goodsWrapper = document.querySelector('.goods-wrapper');
    const cart = document.querySelector('.cart');
    const category = document.querySelector('.category');
    const cardCounter = cardBT.querySelector('.counter');
    const wishlistCounter = wishlistBT.querySelector('.counter');
    const cartWrapper = document.querySelector('.cart-wrapper');

    const wishlist = [];
    const goodsBasket = {};

    //spinner
    const loading = (nameFunction) => {
        const spinner = `<div id="spinner"><div class="spinner-loading"><div><div><div></div>
</div><div><div></div></div><div><div></div></div><div><div></div></div></div></div></div>`;

        if (nameFunction === 'renderCard'){
            goodsWrapper.innerHTML = spinner;
        }

        if (nameFunction === 'renderBasket'){
            cartWrapper.innerHTML = spinner;
        }
    };

    //Request to db
    //transfer data from json to array
    const getGoods = (handler, filter) => {
        //spinner when loading
        loading(handler.name);
        fetch('./db/db.json')
            .then(response => response.json())
            .then(filter)
            .then(handler);
    };

    //cards generation for selling goods
    const createCardGoods = (id, title, price, img) => {
        const card = document.createElement('div');
        card.className = 'card-wrapper col-12 col-md-6 col-lg-4 col-xl-3 pb-3';
        card.innerHTML = `<div class="card">
                            <div class="card-img-wrapper">
                                 <img class="card-img-top" src="./${img}" alt="">
                                 <button class="card-add-wishlist ${wishlist.includes(id) ? 'active' : ''}"
                                     data-goods-id='${id}'></button>
                            </div>
                            <div class="card-body justify-content-between">
                                 <a href="#" class="card-title">${title}</a>
                                 <div class="card-price">${price} ₽</div>
                                 <div>
                                     <button class="card-add-cart" data-goods-id='${id}'>Add to the shopping card</button>
                                 </div>
                            </div>
                          </div>`;
    return card;
    };

    //create shopping list cards
    const createCardGoodsBasket = (id, title, price, img) => {
        const card = document.createElement('div');
        card.className = 'goods';
        card.innerHTML = `
        <div class="goods-img-wrapper">
            <img class="goods-img" src="${img}" alt="">
        </div>
        <div class="goods-description">
             <h2 class="goods-title">${title}</h2>
             <p class="goods-price">${price} ₽</p>
        </div>
        <div class="goods-price-count">
            <div class="goods-trigger">
                <button class="goods-add-wishlist ${wishlist.includes(id) ? 'active' : ''}"
                    data-goods-id="${id}"></button>
                <button class="goods-delete" data-goods-id="${id}"></button>
            </div>
            <div class="goods-count">${goodsBasket[id]}</div>
        </div>`;

        return card;
    };

    //two renders
    //looping through our objects to access id, title, price, imgMin
    const renderCard = (items) => {
        goodsWrapper.textContent = '';

        if (items.length) {
            items.forEach((item) => {
                const {id, title, price, imgMin} = item;
                goodsWrapper.append(createCardGoods(id, title, price, imgMin));
            });
            //if there is nothing print 'sorry'
        } else {
            goodsWrapper.textContent = 'SORRY, THERE IS NO SUCH GOODS'
        }

    };

    //looping through our objects to access id, title, price, imgMin
    const renderBasket = (items) => {
        cartWrapper.textContent = '';

        if (items.length) {
            items.forEach((item) => {
                const {id, title, price, imgMin} = item;
                cartWrapper.append(createCardGoodsBasket(id, title, price, imgMin));
            });
            //if there is nothing print 'sorry'
        } else {
            cartWrapper.textContent = 'SORRY, SHOPPING LIST IS EMPTY'
        }

    };

    //calculation
    //check and increase counters
    const checkCount = () => {
        wishlistCounter.textContent = wishlist.length;
        cardCounter.textContent = Object.keys(goodsBasket).length;
    };

    const calcTotalPrice = goods => {
        let sum = 0;
        for (const item of goods) {
            sum += item.price * goodsBasket[item.id];
        }
        cart.querySelector('.cart-total>span').textContent = sum.toFixed(2);

    };

    //filtration functions
    const showCardBasket = goods => {
        //count total sum of shopping card
        const basketGoods = goods.filter(item => goodsBasket.hasOwnProperty(item.id));
        calcTotalPrice(basketGoods);
        return basketGoods
    };

    const showWishlist = () => {
        getGoods(renderCard, goods => goods.filter(item => wishlist.includes(item.id)))
    };

    //random sort cards
    const randomSort = goods => goods.sort(() => Math.random() - 0.5);

    //work with DB
    //https://learn.javascript.ru/cookie#prilozhenie-funktsii-dlya-raboty-s-kuki
    const getCookie = (name) => {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    };

    const cookieQuery = get => {
        if (get) {
            if (getCookie('goodsBasket')){
                Object.assign(goodsBasket, JSON.parse(getCookie('goodsBasket')));
            }
            checkCount();
        } else {
            document.cookie = `goodsBasket=${JSON.stringify(goodsBasket)}; max-age=86400e3`;
        }
    };

    const storageQuery = (get) => {
        if (get) {
            if (localStorage.getItem('wishlist')) {
                wishlist.splice(0, 0, ...JSON.parse(localStorage.getItem('wishlist')));
            }
            checkCount();
        } else {
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }

    };

    //Events
    //define when to close shopping card
    const  closeCart = (event) => {
        const target = event.target;

        //close when click outside of card or when click on cross
        //close shopping card by pressing 'escape'
        if (target === cart ||
            target.classList.contains('cart-close') ||
            event.keyCode === 27){
            cart.style.display = '';
            document.removeEventListener('keyup', closeCart);
        }
    };

    //define to open shopping card
    const openCart = (event) => {
        //prevent unneeded opening link with after click
        event.preventDefault();
        cart.style.display = 'flex';
        document.addEventListener('keyup', closeCart);
        getGoods(renderBasket, showCardBasket);
    };

    //choose goods by categories
    const chooseCategory = () => {
        event.preventDefault();
        const target = event.target;

        if (target.classList.contains('category-item')) {
            const cat = target.dataset.category;
            getGoods(renderCard, goods => goods.filter((item) => item.category.includes(cat)));
        }
    };

    //search realization
    const searchGoods = event => {
        event.preventDefault();

        const input = event.target.elements.searchGoods;
        const inputValue = input.value.trim();
        if (inputValue !== ''){
            const searchString = new RegExp(inputValue, 'i');
            getGoods(renderCard, goods => goods.filter(item => searchString.test(item.title)));
        } else {
            search.classList.add('error');
            setTimeout( () => {
                search.classList.remove('error');
            }, 2000);
        }
        //empty search string
        input.value = '';
    };

    //enabling wishlist function
    const toggleWishlist = (id, elem) => {
        if (wishlist.includes(id)) {
            wishlist.splice(wishlist.indexOf(id), 1);
            elem.classList.remove('active')
        } else {
            wishlist.push(id);
            elem.classList.add('active')
        }
        checkCount();
        storageQuery();
    };

    const addBasket = id => {
        if (goodsBasket[id]) {
            goodsBasket[id] += 1
        } else {
            goodsBasket[id] = 1
        }
        checkCount();
        cookieQuery();
    };

    const removeGoods = id => {
        delete goodsBasket[id];
        checkCount();
        cookieQuery();
        getGoods(renderBasket, showCardBasket);
    };

    //click Handlers
    const handlerGoods = event => {
        const target = event.target;

        if (target.classList.contains('card-add-wishlist')) {
            toggleWishlist(target.dataset.goodsId, target);
        }
        if (target.classList.contains('card-add-cart')) {
            addBasket(target.dataset.goodsId);
        }
    };

    const handlerBasket = event => {
        const target = event.target;

        if (target.classList.contains('goods-add-wishlist')) {
            toggleWishlist(target.dataset.goodsId, target);
        };

        if (target.classList.contains('goods-delete')) {
            removeGoods(target.dataset.goodsId);
        };
    };

    //initialization
    getGoods(renderCard, randomSort);
    storageQuery('get');
    cookieQuery('get');

    //events assigned
    cardBT.addEventListener('click', openCart);
    cart.addEventListener('click', closeCart);
    category.addEventListener('click', chooseCategory);
    search.addEventListener('submit', searchGoods);
    goodsWrapper.addEventListener('click', handlerGoods);
    cartWrapper.addEventListener('click', handlerBasket);
    wishlistBT.addEventListener('click', showWishlist);

});