$(function () {

  var fn = {}, dom = {
    main   : $('#main'),
    jotter : $('#jotter'),
    from   : $('#from'),
    head   : $('#head'),
    type   : $('#type'),
    input1 : $('#input1'),
    input2 : $('#input2'),
    post   : $('#post'),
    back   : $('#jotter .back'),
    cancel : $('#cancel'),
    send   : $('#send'),
    logo   : $('header h1 a'),
    navi   : $('nav a')
  };

  // socket.io

  var socket = io.connect('http://localhost');
  socket.on('create', function (req) {
    $.ajax({
      url  : '/jots',
      type : 'POST',
      data : { items: req },
      complete : function (data)  {
        dom.main.isotope('insert', $(data.responseText)).isotope('reloadItems');
      }
    });
  });
  socket.on('remove', function (id) {
    var target = $('article[x-id='+id+']');
    dom.main.isotope('remove', target);
  });
  socket.on('unpin', function (id) {
    var target = $('article[x-id='+id+']');
    var sort = target.attr('x-sort');
    target.attr('x-sort', '0' + sort.substr(1));
    target.parent().removeClass('pin').addClass('unpin');
    target.find('.pinn').removeClass('pin').addClass('unpin');
  });

  // pjax

  $(document)
    .on('pjax:start', function () { dom.main.css({opacity:0}); })
    .on('pjax:end',   function () { dom.main.css({opacity:1}); });
  $('a').pjax('#main');

  // isotope

  dom.main.isotope({
    itemSelector  : 'article',
    layoutMode    : 'masonry',
    masonry       : {
      gutterWidth: 50,
      columnWidth: 10
    },
    sortBy        : 'pindate',
    sortAscending : false,
    getSortData   : {
      pindate : function ($e) {
        return $e.attr('x-sort');
      }
    }
  });

  // window events

  $(window).on('resize', function () {
    if ($(window).width() < 650) {
      dom.logo.css({ width: '100px' });
      dom.navi.css({ width: '50px' });
    } else {
      dom.logo.css({ width: '200px' });
      dom.navi.css({ width: '100px' });
    }
  });
  $(window).trigger('resize');

  $(window).on('keypress', function () {
    console.log(event.keyCode);
  });


  // jot events

  $('nav a').on('click', function () {
    $('nav a').removeClass('selected');
    $(this).addClass('selected');
    var selector = $(this)
    switch ($(this).html()) {
      case 'pin' :
        dom.main.isotope({ filter:'.pin' });
        break;
      case 'jot' :
        dom.main.isotope({ filter:'*' });
        break;
    }
  });

  // UNPIN
  $(document).on('click', '.pinn', function () {
    var pin, self = $(this);
    if (self.hasClass('pin')) {
      socket.emit('unpin', self.parent().attr('x-id'));
    } else {
      socket.emit('remove', self.parent().attr('x-id'));
    }
  });

  fn.cancel = function () {
    dom.jotter.fadeOut(240, function () {
      dom.from.val('');
      dom.head.val('');
      dom.type.val('text');
      dom.input1.val('').css({ top: 0 });
      dom.input2.val('').hide();
    });
  };

  fn.sendto = function () {
    var data = {
      from : dom.from.val(),
      head : dom.head.val(),
      type : dom.type.val(),
      text : dom.input1.val(),
      addr : dom.input2.val()
    };
    for (var i in data) {
      console.log('"' + i + '"', data[i]);
      if (data['type'] == 'text') {
        if (i != 'addr') {
          if ('' == data[i]) {
            alert('All inlets must be filled out.');
            return false;
          }
        }
      } else {
        if (i != 'text' && '' == data[i]) {
          alert('All inlets must be filled out.');
          return false;
        }
      }
    }
    data.date = ~~(new Date/1000);
    socket.emit('create', data);
    fn.cancel();
  }

  dom.post.on('click', function () {
    dom.jotter.fadeIn(240);
  });
  dom.back.on('click', function () {
    dom.jotter.fadeOut(240);
  });
  dom.cancel.on('click', fn.cancel);
  dom.send.on('click', fn.sendto);

  var val, preval = 'text';
  fn.fixer = function (text) {
    if ('' == text) {
      dom.input2.attr({ placeholder: text }).fadeOut(120, function () {
        $(this).val('');
      });
    } else {
      dom.input2.attr({ placeholder: text }).fadeIn(240);
    }
    dom.input1.animate({ top: '' == text ? 0 : '30px' });
  };
  dom.type.on('change', function () {
    var val = $('#type option:selected').val();
    dom.type.css({
      backgroundImage: 'url(/images/' + val + '.png)'
    });
    if (preval != val) {
      switch (val) {
        case 'text':  fn.fixer(''); break;
        case 'link':  fn.fixer('Web Site URL'); break;
        case 'image': fn.fixer('Image URL'); break;
        case 'video': fn.fixer('Video URL'); break;
        case 'audio': fn.fixer('Audio URL'); break;
      }
      preval = val;
    }
  });

});
