/**
 *@fileOverview
 *@author thliu
 @version 3.8.0
 @updateDate 2016/6/6
 */
var UploadFilelist = React.createClass({
    getInitialState: function() {
        return {data:{status:'-',files: []}};
    },
    update: function () {
        this.setState({data: uploadlist});
    },
    render: function () {
        var ItemNodes = this.state.data?this.state.data.files.map(function (item) {
            return (
                <FilelistItem data={item} key={item.id}> </FilelistItem>
            );
        }):"";
        return (
            <div className="upload-task-list" >
                <FilelistBarTitle status={this.state.data.status}></FilelistBarTitle>
                <FilelistTastTitle></FilelistTastTitle>
                <FilelistErrorWrapper></FilelistErrorWrapper>
                <ul >
                    {ItemNodes}
                </ul>
            </div>
        );
    }
});

var FilelistBarTitle=React.createClass({
    render:function(){
      return (
          <div className="bar-title">
              <div className="min-progress"></div>
              <div className="max-title f-l">
                  <span id="upload_txt">{this.props.status}</span>
                  <span id="total_count"></span>
                  <span id="upload_progress"></span>
              </div>
              <div className="f-r op">
                  <span id="set-min" ></span>
                  <span id="close-upload-task-list"></span>
              </div>
          </div>
      )
    }
});

var FilelistErrorWrapper=React.createClass({
    render:function(){
        return (
            <div className="error-handle">
                <div className="message"></div>
            </div>
        )
    }
});

var FilelistTastTitle=React.createClass({
    cancelAll:function(){
        $('#container').trigger('cancel-all');
    },
   render:function(){
       return (
           <div className="task-title">
               <div className="f-l col-bar-filename">文件</div>
               <div className="f-l col-progress">进度</div>
               <div className="f-l col-size">大小</div>
               <div className="f-l col-time">剩余时间</div>
               <div className="f-l col-operate"><a className="btn"  onClick={this.cancelAll} >取消所有</a>
               </div>
           </div>
       );
   }
});

var FilelistItem = React.createClass({
    cancel:function (val) {
        $('#container').trigger('cancel-one',[this.props.data]);
    },
    render: function () {
        var operateBtn=<a onClick={this.cancel}>删除</a>;
        if(this.props.data.percent===1){
            operateBtn="完成";
        }
        return (
            <li>
                <div className="task-file" id="task_swfupload_{this.props.data.id}" >
                    <div className="f-l col-icon pic"></div>
                    <div className="f-l col-filename"  title = {this.props.data.name}> {this.props.data.name}</div>
                    <div className="f-l col-progress"  title = {this.props.data.name}><span className="progress" style = {{width:this.props.data.percent*100}} >{this.props.data.percent*100}%</span></div>
                    <div className="f-l col-size" >{this.props.data.size}</div>
                    <div className="f-l col-time" >{this.props.data.timeRemaining}</div>
                    <div className="f-l col-operate" >
                        {operateBtn}
                    </div>
                </div>
            </li>
        );
    }
});

window.reactFilelist  = ReactDOM.render(
    <UploadFilelist data={uploadlist?uploadlist:{}}/>,
    document.getElementById('container')
);
