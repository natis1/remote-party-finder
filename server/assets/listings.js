(function () {
    let stateWasNull = false;

    const state = {
        allowed: [],
        centre: [ 'All' ],
        list: null,
        lang: null,
    };

    function addJsClass() {
        document.children[0].className = 'js';
    }

    function saveLoadState() {
        let saved = localStorage.getItem('state');
        if (saved !== null) {
            try {
                saved = JSON.parse(saved);
                if (!Array.isArray(saved.allowed)) {
                    saved = {};
                    stateWasNull = true;
                }
            } catch (e) {
                saved = {};
                stateWasNull = true;
            }

            for (let key in saved) {
                state[key] = saved[key];
            }
        } else {
            stateWasNull = true;
        }

        window.addEventListener('pagehide', () => {
            let copy = {};
            for (let key in state) {
                if (key === 'list') {
                    continue;
                }

                copy[key] = state[key];
            }

            localStorage.setItem('state', JSON.stringify(copy));
        });
    }

    function reflectState() {
        let category = document.getElementById('category-filter');
        for (let option of category.options) {
            if (stateWasNull) {
                console.log('was null');
                state.allowed.push(option.value);
            }

            option.selected = state.allowed.includes(option.value);
        }

        let dataCentre = document.getElementById('data-centre-filter');
        for (let option of dataCentre.options) {
            if (stateWasNull) {
                console.log('was null');
                state.centre.push(option.value);
            }

            option.selected = state.centre.includes(option.value);
        }

        let language = document.getElementById('language');
        if (state.lang === null) {
            state.lang = language.dataset.accept;
        }

        let cookie = document.cookie
                             .split(';')
                             .find(row => row.trim().startsWith('lang='));
        if (cookie !== undefined) {
            state.lang = decodeURIComponent(cookie.split('=')[1]);
        }
    }

    function setUpList() {
        let options = {
            valueNames: [
                'duty',
                'creator',
                'description',
                {data: ['centre']},
            ],
        };
        return new List('container', options);
    }

    function refilter() {
        function categoryFilter(item) {
            let category = item.elm.dataset.pfCategory;

            return category === 'unknown' || state.allowed.includes(category);
        }

        function dataCentreFilter(item) {
            return state.centre.includes('All') || state.centre.includes(item.values().centre);
        }

        state.list.filter(item => dataCentreFilter(item) && categoryFilter(item));
    }

    function setUpDataCentreFilter() {
        let select = document.getElementById('data-centre-filter');

        let dataCentres = {};
        for (let elem of document.querySelectorAll('#listings > .listing')) {
            let centre = elem.dataset['centre'];
            if (!dataCentres.hasOwnProperty(centre)) {
                dataCentres[centre] = 0;
            }

            dataCentres[centre] += 1;
        }

        for (let opt of select.options) {
            let centre = opt.value;
            let count = 0;

            if (dataCentres.hasOwnProperty(centre)) {
                count = dataCentres[centre];
            }

            if (centre === 'All') {
                count = Object.values(dataCentres).reduce((a, b) => a + b, 0);
            }

            opt.innerText += ` (${count})`;
        }

        select.addEventListener('change', () => {
            let centre = [];

            for (let option of select.options) {
                if (!option.selected) {
                    continue;
                }

                let category = option.value;
                centre.push(category);
            }

            state.centre = centre;
            refilter();
        });
    }

    function setUpCategoryFilter() {
        let select = document.getElementById('category-filter');

        select.addEventListener('change', () => {
            let allowed = [];

            for (let option of select.options) {
                if (!option.selected) {
                    continue;
                }

                let category = option.value;
                allowed.push(category);
            }

            state.allowed = allowed;
            refilter();
        });
    }

    addJsClass();
    saveLoadState();
    reflectState();
    state.list = setUpList();
    setUpDataCentreFilter();
    setUpCategoryFilter();
    refilter();
})();
