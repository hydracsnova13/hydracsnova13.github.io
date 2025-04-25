/* global $ */
$(function(){
    const $uname  = $('#username-field');
    const $save   = $('#save-profile');
    const $avatar = $('#prof-avatar');
    let   avatarFile = null, dirty = false;
  
    function enableSave(){ $save.prop('disabled', !dirty); }
  
    $('#close-profile').on('click',()=>$('#profile-backdrop').hide());
  
    $('#edit-username').on('click',()=>{
      const ro = $uname.prop('readonly');
      $uname.prop('readonly',!ro).focus();
      dirty = true; enableSave();
    });
  
    $('#change-photo').on('click',()=>$('#file-input').click());
  
    $('#file-input').on('change',e=>{
      avatarFile = e.target.files[0];
      if(avatarFile){
        $avatar.attr('src',URL.createObjectURL(avatarFile));
        dirty = true; enableSave();
      }
    });
  
    $save.on('click',()=>{
      const fd = new FormData();
      fd.append('username', $uname.val());
      if(avatarFile) fd.append('avatar', avatarFile);
  
      $.ajax({url:'/profile/update', method:'POST', data:fd,
              contentType:false, processData:false})
        .done(res=>{
          if(res.ok){
            $('.username').text(res.username);
            if(res.avatar) $('.avatar').attr('src', res.avatar);
            dirty=false; enableSave();
            alert('Profile updated!');
          }
        })
        .fail(xhr=>{
          alert(xhr.status===409 ? 'Username already taken'
                                 :'Update failed, try again.');
        });
    });
  });
  