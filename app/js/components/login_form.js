var React = require('react');

var LoginForm = React.createClass({
  handleSubmit: function(e){
    // var credentials = $(e.target).serializeObject();
    // this.props.login(credentials);
    // e.preventDefault();
    // https://github.com/login/oauth/authorize?client_id=bcf17976f7287a31fcf9&scope=repo&state=132
    window.location.href = 'https://github.com/login/oauth/authorize?redirect_uri=http://www.tseivan.com/pull_request_dashboard/&client_id=bcf17976f7287a31fcf9&scope=repo&state=' + data.randomState;
    return false;
  },
  render: function(){
    return (
    <div>
      <h1 className="text-center">Pull Request Dashboard</h1>
      <div id="container">
        <h2 className="text-center">Log in with Github credentials</h2>
        <form className="login" role="form" onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input name="username" type="text" className="form-control" id="username" placeholder="Enter Username" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input name="password" type="password" className="form-control" id="password" placeholder="Password" />
          </div>

          <button type="submit" className="btn btn-default">Submit</button>
        </form>
      </div>
    </div>
    );
  }
});

module.exports = LoginForm;
