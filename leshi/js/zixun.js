$(function() {
   //手风琴
	$(".accordion").on("click",".title",e=>
    $(e.target).next(".content").toggleClass("in")
      .siblings(".content").removeClass("in")
  );

      //字体效果
      Vue.directive('flash',{
          inserted(el){
              setInterval(function(){
                  el.style.color=(function(){
                      var r=Math.random()*255;
                      var g=Math.random()*255;
                      var b=Math.random()*255;
                      return `rgb(${r},${g},${b})`
                  })()
              },200)
          }
      })
      new Vue({
          el:'#app',
          data:{}
      })

      //标题栏切换
      $('.header>ul>li').on('click','[data-toggle=tab]',function(e){
          e.preventDefault();
          $(this).parent().addClass('active').siblings().removeClass('active')
          var id=$(this).attr('data-href')
          $(id).addClass('a2').siblings().removeClass('a2')
      })
})