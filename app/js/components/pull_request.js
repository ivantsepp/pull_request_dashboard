var React = require('react');

var PullRequest = React.createClass({
  getInitialState: function() {
    return {
      body: '',
      mergeable: true,
      merged: false,
      title: '',
      label: '',
      avatar: '',
      statuses: []
    };
  },
  componentWillMount: function(){
    var url = 'https://api.github.com/repos/'+this.props.owner+'/'+this.props.repo+'/pulls/'+this.props.id + '?access_token=' + this.props.token;
    $.get(url, this.success);
  },
  success: function(data){
    this.setState({
      body: data.body,
      mergeable: data.mergeable,
      merged: data.merged,
      title: data.title,
      label: data.head.label,
      avatar: data.user.avatar_url
    });
    var self = this;
    var statusUrl = data.statuses_url;
    statusUrl = statusUrl.replace('statuses', 'status');
    statusUrl += '?access_token=' + this.props.token;
    $.get(statusUrl, function(data){
      var statuses = [];
      data.statuses.forEach(function(s){
        statuses.push({description: s.description, targetUrl: s.target_url, state: s.state, id: s.id});
      });
      self.setState({
        statuses: statuses
      });
    });
  },
  handleClick: function(){
    this.props.removePullRequest(this.props.id);
  },
  parseBody: function(){
    var string = this.state.body.replace(/\[#(.*)\]/, function(str, number){
      return '<a href="https://www.pivotaltracker.com/story/show/'+number+'">[#'+number+']</a>';
    });
    return string;
  },
  render: function(){
    var mergeableClass, mergeableIconClass;
    if (this.state.merged) {
      mergeableClass = 'merged';
      mergeableIconClass = 'octicon-git-pull-request';
    }
    else if (this.state.mergeable){
      mergeableClass = 'mergeable';
      mergeableIconClass = 'octicon-git-merge';
    } else {
      mergeableClass = 'unmergeable';
      mergeableIconClass = 'octicon-git-pull-request';
    }
    var statusesNodes = [];
    this.state.statuses.forEach(function(s){
      statusesNodes.push(<div key={s.id}>{s.description} (<a href={s.targetUrl}>Details</a>)</div>);
    });
    return (
      <li>
        <div className="pull-request-item">
          <div className="remove" onClick={this.handleClick}>
            ✖
          </div>
          <div className="status">
            <div className={mergeableClass}>
              <span className={"mega-octicon "+mergeableIconClass}></span>
            </div>
          </div>
          <div className="avatar">
            <img src={this.state.avatar} height="48px" width="48px"/>
          </div>
          <div className="header">
            <span className="title">#{this.props.id}: {this.state.title}</span>
            <span className="branch-container"><span className="branch">{this.state.label}</span></span>
          </div>
          <div className="description">
             <div dangerouslySetInnerHTML={{__html: this.parseBody()}} />
          </div>
          <div className="build-status">
             {statusesNodes}
          </div>
          <div className="clear"></div>
        </div>
      </li>
    );
  }
});

module.exports = PullRequest;
