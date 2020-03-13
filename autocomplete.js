//這份程式碼只會有autocomplete最核心的功能, 且不會受外在影響, 也就是說, 它不倚賴任何預設, 無論外部使用什麼api, api的資料格式如何, autocomplete會被render在哪裡, 這份程式碼都不受影響, 它只會接受外部傳入的參數/功能(或不傳入)執行自己的核心功能

//解構: 外部傳入的config物件
const createAutoComplete = ({root, renderOption, onOptionSelect, inputValue, fetchData}) => {
    //autocomplete產生的下拉選單(class來自bulma css)
    root.innerHTML = `
        <label><b>Search</b></label>
        <input class='input' />
        <div class='dropdown'>
        <div class='dropdown-menu'>
        <div class='dropdown-content results'></div>
        </div>

        </div>
    `;
    //dom 元素
    //從root創建出的dom元素中查找這些元素, 而不用從整個網頁
    const input = root.querySelector('input');
    const dropdown = root.querySelector('.dropdown');
    const resultsWrapper = root.querySelector('.results');

    const onInput = async event => {
        //調用config中的fetchData
        const items = await fetchData(event.target.value);
        //若items中沒有東西, 就徹底關掉dropdown, 並跳出
        if (!items.length) {
            dropdown.classList.remove('is-active');
            return;
        }
        //清空上一次的搜尋結果產生的option
        resultsWrapper.innerHTML = '';
        dropdown.classList.add('is-active');
        for (let item of items) {
            const option = document.createElement('a');
            option.classList.add('dropdown-item');
            //根據外部傳入的樣式(renderOption中回傳)渲染選項
            //autocomplete不會自己決定選項的樣式, 如此一來, 外部的設定就能自己客製化
            option.innerHTML = renderOption(item);
            option.addEventListener('click', () => {
                dropdown.classList.remove('is-active');
                //外部傳入input欄位的值
                input.value = inputValue(item);
                //選取電影後, 要對另一個endpoint發出請求
                onOptionSelect(item);
            })
            resultsWrapper.appendChild(option);
        }
    };

    //input event
    input.addEventListener('input', debounce(onInput, 500));


    document.addEventListener('click', event => {

        if (!root.contains(event.target)) {
            dropdown.classList.remove('is-active');
        }
    });


}