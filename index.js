const autoCompleteConfig ={
    //下拉選單中的選項的樣式可客製化
    renderOption(movie){
        const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster;  
        return `
        <img src="${imgSrc}" />
        ${movie.Title}  (${movie.Year})
        `;
    },
    //欄位的值, 選中一個選項時, 輸入欄位應該變成movie.Title的值
    inputValue(movie){
        return movie.Title;
    },
    async fetchData(searchTerm){
        /**
         * axios.get('url', {
         * 參數物件params (可見api文檔):{}
         * })
         */
        const response = await axios.get("http://www.omdbapi.com/", {
            params:{
                apikey: 'c39c84dd',
                //search query
                s:searchTerm
            }
        });
        //若是沒有符合的搜尋, 回傳空陣列
        if(response.data.Error){
            return [];
        }
        console.log(response.data.Search);
        return response.data.Search;
    },
};


createAutoComplete({
    //複製autoCompleteConfig內的所有東西
    ...autoCompleteConfig,
    root: document.querySelector('#left-autocomplete'),
    //選到某選項後就做...
    onOptionSelect(movie){
        document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
    },
});

createAutoComplete({
    ...autoCompleteConfig,
    root: document.querySelector('#right-autocomplete'),
    //選到某選項後就做...
    onOptionSelect(movie){
        document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
    },
});

let leftMovie;
let rightMovie;

//選中某部電影後, 就根據該電影的imdnID(i)做另外一個請求, 取得更詳細資訊
const onMovieSelect = async(movie, summaryElement, side)=>{
    const response = await axios.get("http://www.omdbapi.com/", {
        params:{
            apikey: 'c39c84dd',
            //search query
            i:movie.imdbID
        }
    });
    summaryElement.innerHTML = movieTemplate(response.data);
    if(side === 'left'){
        leftMovie = response.data;
    }else{
        rightMovie = response.data;
    }

    if(leftMovie && rightMovie){
        runComparison();
    }
};

const runComparison = ()=>{
    const leftSideStats = document.querySelectorAll('#left-summary .notification');
    const rightSideStats = document.querySelectorAll('#right-summary .notification');

    leftSideStats.forEach((leftStats, index)=>{
        const rightStats = rightSideStats[index];
        const leftSideValue = parseInt(leftStats.dataset.value);
        const rightSideValue = parseInt(rightStats.dataset.value);

        if(rightSideValue > leftSideValue){
            rightStats.classList.remove('is-primary');
            rightStats.classList.add('is-danger');
        }else{
            leftStats.classList.remove('is-primary');
            leftStats.classList.add('is-danger');
        }
    })
};

const movieTemplate =(movieDetail)=>{
    //'629,000,000' => 629000000            
    //regExp: /$/g => globally search for sign '$' 在整個字串中尋找$符號, $是正規表達式中的特殊符號, 使用\讓它能被視為普通字元
    const dollars = parseInt(movieDetail.BoxOffice.replace(/\$/g, '').replace(/,/g, ''));
    const metascore = parseInt(movieDetail.Metascore);
    const imdbRating = parseFloat(movieDetail.imdbRating);
    const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ''));
    //獎項比較: Won 2 Oscars. Another 79 wins & 57 nominations. > Won 3 Oscars
    //取出字串中所有數字並相加再比值
    // let count = 0;
    // const awards = movieDetail.Awards.split(' ').forEach((word)=>{
    //     const value = parseInt(word);
    //     if(isNaN(value)){
    //         return;
    //     }else{
    //         count = count + value;
    //     }
    // });
    //使用reduce 
    const awards = movieDetail.Awards.split(' ').reduce((prev, word)=>{
        const value = parseInt(word);
        if(isNaN(value)){
            return prev;
        }else{
            return prev + value;
        }
    }, 0);
    


    return `
      <article class='media'>
        <figure class='media-left'>
            <p class='image'>
                <img src='${movieDetail.Poster}'/>
            </p>
        </figure>
        <div class='media-content'>
            <div class='content'>
                <h1>${movieDetail.Title}</h1>
                <h4>${movieDetail.Genre}</h4>
                <p>${movieDetail.Plot}</p>
            </div>
        </div>
      </article>

      <article data-value=${awards} class='notification is-primary'>
        <p class='title'>${movieDetail.Awards}</p>
        <p class='subtitle'>Awards</p>
      </article>

        <article data-value=${dollars} class='notification is-primary'>
            <p class='title'>${movieDetail.BoxOffice}</p>
            <p class='subtitle'>Box Office</p>
        </article>

        <article data-value=${metascore} class='notification is-primary'>
            <p class='title'>${movieDetail.Metascore}</p>
            <p class='subtitle'>Metascore</p>
        </article>

        <article data-value=${imdbRating} class='notification is-primary'>
            <p class='title'>${movieDetail.imdbRating}</p>
            <p class='subtitle'>IMDB Rating</p>
        </article>

        <article data-value=${imdbVotes} class='notification is-primary'>
            <p class='title'>${movieDetail.imdbVotes}</p>
            <p class='subtitle'>IMDB Votes</p>
        </article>

    `;
}




