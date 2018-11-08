$(document).ready(function(){
    //头部导航栏悬停
    $('#dao').hover(function(e){
        e.preventDefault();
        $(this).next().removeClass().addClass('hover-up')
        $('#box').slideDown(300);
    },function(e){
        e.preventDefault();
        $(this).next().removeClass().addClass('hover-down')
        $('#box').hide();
    });
    $('.hidden-box').hover(function(){
        $('#dao').next().removeClass().addClass('hover-up')
        $(this).show();
    },function(){
        $('#dao').next().removeClass().addClass('hover-down')
        $(this).slideUp(200);
    });
    /*ul li分页*/ 
    $('#tab>li').on("click","[data-toggle=tab1]",e=>{
            e.preventDefault();
            var $tar=$(e.target);
            if(!$tar.parent().is(".active")){
            $tar.parent().addClass("active")
                .siblings().removeClass("active");
            var id=$tar.attr("href");
            $(id).addClass("activet")
                .siblings().removeClass("activet");
            }
    })
    /*轮播*/ 
    $(".lunbo div.bg div.libiao ul li").hover(function(){
        var index = $(this).index();
        $(this).addClass("first").siblings().removeClass("first");
        $(".lunbo div.img ul li").eq(index).css({"display":"block","opacity":"0"}).
        animate({"opacity":1},500).siblings().css({"opacity":1,"display":"none"});//自定义动画
         //alert(index);
    });


    /*滚轮事件*/
     $(window).on('scroll',function(){
         var top=$(this).scrollTop();
        if(top>550){
            $('#head').css('position','fixed')
            $('#head').css('background','rgba(255, 255, 255, .94)')
         }if(top<550){
            $('#head').css('position','absolute')
            $('#head').css('background','rgba(0,0,0,0)')
         }
     });

     /*轮播2*/ 
     //自动播放
     var index1=0;
     var setTime=null;
     $('ul.button>li').hover(function(){
         clearInterval(setTime);
         var index1=$(this).index();
         $(this).addClass('hover').siblings().removeClass('hover');
         $('.scroll').animate({top:-(index1*350)},1500);
     },function(){
         autoPlay();
     })
     function autoPlay(){
         setTime=setInterval(function(){
             index1++;
             if(index1>3){index1=0}
             $('ul.button>li').eq(index1).addClass('hover').siblings().removeClass('hover');
             $('.scroll').animate({top:-(index1*350)},1500);
         },3000)
     }
     autoPlay();
});
