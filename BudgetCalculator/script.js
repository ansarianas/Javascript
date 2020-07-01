var budgetController = (() => {

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calculatePercentage = function (totalIncome) {
        totalIncome > 0 ? this.percentage = Math.round((this.value / totalIncome) * 100) : this.percentage = -1;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = (type) => {
        var total = 0;
        data.allItems[type].forEach((currAmt) => total += currAmt.value);
        data.total[type] = total;
    }

    return {
        test: () => data,

        addItem: (description, value, type) => {
            var arr = data.allItems[type], newItem, ID;
            arr.length > 0 ? ID = arr[arr.length - 1].id + 1 : ID = 0;
            type === 'exp' ? newItem = new Expense(ID, description, value) : newItem = new Income(ID, description, value);
            arr.push(newItem);
            return newItem;
        },

        deleteItem: (id, type) => data.allItems[type].forEach((curr, index) => (curr.id === id) ? data.allItems[type].splice(index, 1) : ''),

        calculateBudget: (type) => {

            //1-Calculate budget 
            type === 'inc' ? calculateTotal('inc') : calculateTotal('exp');

            //2-budget = inc-exp
            data.budget = data.total.inc - data.total.exp;

            //3-percentage = inc spent
            data.total.inc > 0 ? data.percentage = Math.round((data.total.exp / data.total.inc) * 100) : data.percentage = -1;

        },

        calculatePercentages: () => data.allItems.exp.forEach((curr) => curr.calculatePercentage(data.total.inc)),

        getPercentage: () => data.allItems.exp.map((curr) => curr.getPercentage()),

        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            }
        }
    }
})();

var uiController = (() => {

    var DOMstr = {
        description: '.add__description',
        value: '.add__value',
        type: '.add__type',
        addBtn: '.add__btn',
        deleteBtn: '.ion-ios-close-outline',
        inclist: '.income__list',
        explist: '.expenses__list',
        budget: '.budget__value',
        inc: '.budget__income--value',
        exp: '.budget__expenses--value',
        percentage: '.item__percentage',
        expPercentage: '.budget__expenses--percentage',
        month: '.budget__title--month'
    }

    var clearFields = () => $(`${DOMstr.value},${DOMstr.description}`).val('');

    var formatNumber = (num, type) => {
        var int, dec;
        num = Math.abs(num).toFixed(2).split('.');
        int = num[0];
        if (int.length > 3)
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        dec = num[1];
        return `${type === 'exp' ? '-' : '+'} ${int}.${dec}`;
    }


    return {
        DOMel: () => DOMstr,

        getInput: () => {
            return {
                description: $(DOMstr.description).val(),
                value: $(DOMstr.value).val(),
                type: $(DOMstr.type).val()
            }
        },

        addList: (obj, type) => {
            const expPercentage = `<div class="item__percentage">${obj.percentage} %</div>`,
                markup = `
            <div class="item clearfix" id="${type}-${obj.id}">
            <div class="item__description">${obj.description}</div>
            <div class="right clearfix">
                <div class="item__value">${formatNumber(obj.value, type)}</div>
                ${type === 'exp' ? expPercentage : ''}
                <div class="item__delete">
                    <button class="item__delete--btn">
                      <i class="ion-ios-close-outline"></i>
                    </button>
                </div>
            </div>
            </div>`
            type === 'inc' ? $(DOMstr.inclist).append(markup) : $(DOMstr.explist).append(markup);
            clearFields();
            $(DOMstr.description).focus();
        },

        deleteList: (id, type) => $(`#${type}-${id}`).remove(),

        displayBudget: (obj) => {
            $(DOMstr.budget).html(`${formatNumber(obj.budget, 'inc')} <span>&#8377;</span>`);
            $(DOMstr.inc).html(`${formatNumber(obj.totalInc, 'inc')} <span>&#8377;</span>`);
            $(DOMstr.exp).html(`${formatNumber(obj.totalExp, 'exp')} <span>&#8377;</span>`);
            obj.percentage > 0 ? $(DOMstr.expPercentage).text(`${obj.percentage} %`) : $(DOMstr.expPercentage).text('...');
        },

        displayMonth: () => {
            var arr_month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                date = new Date(),
                month = date.getMonth(),
                year = date.getFullYear();
            return `${arr_month[month]}, ${year}`
        },

        changeType: () => {
            $(`${DOMstr.value},${DOMstr.description}`).toggleClass('red-focus');
            $(DOMstr.addBtn).toggleClass('red');
        }
    }
})();


var appController = ((budget, ui) => {

    var DOMstr = ui.DOMel();

    var eventListener = () => {
        $(DOMstr.addBtn).click(addItem);
        $(document).on('click', DOMstr.deleteBtn, deleteItem);
        $(document).keypress((ev) => ev.keyCode == 13 || ev.which == 13 ? addItem() : null);
        $(DOMstr.type).on('change', ui.changeType);
    }

    var updateBudget = (type) => {
        //1-Calculate budget
        budget.calculateBudget(type);

        //2-Return budget
        var data = budget.getBudget();

        //3-Display budget on UI
        ui.displayBudget(data);
    }

    var addItem = () => {
        var input, newItem, val, desc, type;

        //1-Get input data
        input = ui.getInput();
        val = parseFloat(input.value);
        desc = input.description;
        type = input.type;

        if (desc !== "" && !isNaN(val)) {
            //2-Add item to budget controller
            newItem = budget.addItem(desc, val, type);

            //3-Update percentages
            budget.calculatePercentages();

            //4-Add item to UI
            ui.addList(newItem, type);

            //5-Update budget
            updateBudget(type);
        }
    }

    var deleteItem = function () {

        //1-Get the item which needs to be deleted
        var itemId = $(this).closest('.item.clearfix').attr('id').split('-');

        //2-Retrieve its id and type
        var type = itemId[0],
            id = parseInt(itemId[1]);

        //3-Delete from DS
        budget.deleteItem(id, type);

        //4-Delete item from UI
        ui.deleteList(id, type);

        //5-Update budget
        updateBudget(type);

        //6-Update percentages
        budget.calculatePercentages();
    }

    //Initialize the UI with this data
    var init = {
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
    }

    return {
        init: () => {
            eventListener();
            ui.displayBudget(init);
            $(DOMstr.month).text(ui.displayMonth());
        }
    }
})(budgetController, uiController);

//App starting point
appController.init();