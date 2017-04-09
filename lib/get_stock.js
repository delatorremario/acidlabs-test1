function GetStock(){
    setInterval(()=>{
        //get info from API: http://finance.google.com/finance/info?client=ig&q=AAPL,ABC,MSFT,TSLA,F

        console.log(new Date());
    },1000);
}
function init(listener,callback) {
    //get stock info at interval time
    GetStock();
    return callback();

}
module.exports = {
    init:init,
}