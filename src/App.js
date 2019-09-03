import React, { Component } from "react";
import "./App.css";
// import UIkit from 'uikit';
// import Icons from 'uikit/dist/js/uikit-icons';

//TODO

// * Apply styles

const list = [
  {
    title: "React",
    url: "https://reactjs.org/",
    author: "Jordan Walke",
    num_comments: 3,
    points: 4,
    objectID: 0
  },
  {
    title: "Redux",
    url: "https://redux.js.org/",
    author: "Dan Abramov, Andrew Clark",
    num_comments: 2,
    points: 5,
    objectID: 1
  }
];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      list,
      searchTerm: '',
    };
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  onDismiss(id) {
    const isNotId = item => item.objectID !== id;
    const updatedList = this.state.list.filter(isNotId);
    this.setState({ list: updatedList });
   }

   onSearchChange(event) {
     this.setState({ searchTerm : event.target.value })
  }

  render() {
    const { searchTerm, list} = this.state;
    return (
      <div className="App">
        <h1 className="uk-heading-small uk-text-center">Books List</h1>
        <div className="uk-container uk-container-small">
          <Search 
            value={searchTerm}
            onChange={this.onSearchChange}
            placeholder="Поиск..."
            ukIcon="icon: search"
          >
          </Search>
          <Table 
            list={list}
            pattern={searchTerm}
            onDismiss={this.onDismiss}
          />
        </div>
      </div>
    );
  }
}

const Button = ({ onClick, className ='', children}) => (
    <button onClick={onClick} className={className} type="button">
      {children}
    </button>
);

const Search = ({ value, onChange, children, placeholder, ukIcon}) => (
    <form className="uk-form-horizontal">
      {children}
      <div className="uk-inline">
          <span class="uk-form-icon" uk-icon={ukIcon}></span>
          <input
            type="text"
            className="uk-input"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
      </div>
    </form> 
  );

const Table = ({list, pattern, onDismiss}) => (
      <table class="uk-table uk-table-hover uk-table-divider">
        <thead>
            <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Number of Comments</th>
                <th>Points</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
        { list.filter(isSearched(pattern)).map(item =>
          <tr key={item.objectID}>
            <td>
              <a href={item.url}>{item.title}</a>
            </td>
            <td>{item.author}</td>
            <td>{item.num_comments}</td>
            <td>{item.points}</td>
            <td>
              <Button
                onClick={() => onDismiss(item.objectID)}
              >
                Dismiss
              </Button>
            </td>
          </tr>
        )}
        </tbody>
      </table>
);

function isSearched(searchTerm) {
  return function (item) {
    return item.title.toLowerCase().includes(searchTerm.toLowerCase());
  }
}

export default App;
