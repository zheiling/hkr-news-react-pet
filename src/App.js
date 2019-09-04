import React, { Component } from "react";
import "./App.css";
// import UIkit from 'uikit';
// import Icons from 'uikit/dist/js/uikit-icons';

const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      result: null,
      searchTerm: DEFAULT_QUERY,
    };

    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);

  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.fetchSearchTopStories(searchTerm);
  }

  setSearchTopStories(result) {
      this.setState({ result });
  }


  fetchSearchTopStories () {
    const { searchTerm } = this.state;
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`)
    .then(response => response.json())
    .then(result => this.setSearchTopStories(result))
    .catch(error => error);
  }

  onDismiss(id) {
    const isNotId = item => item.objectID !== id,
          updatedHits = this.state.result.hits.filter(isNotId);

    this.setState({ 
        result : { ...this.state.result, hits: updatedHits }
     });
   }

   onSearchChange(event) {
     this.setState({ searchTerm : event.target.value })
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.fetchSearchTopStories(searchTerm);
    event.preventDefault();
  }

  render() {
    const { searchTerm, result} = this.state;
    
    return (
      <div className="App">
        <div className="uk-container">
          <h1 className="uk-heading-small uk-text-center">Hacker News</h1>
          <div className="control-panel">
            <Search 
              value={searchTerm}
              onChange={this.onSearchChange}
              onSubmit={this.onSearchSubmit}
              placeholder="Поиск..."
            >
            </Search>
          </div>
            { result &&
              <Table 
                list={result.hits}
                onDismiss={this.onDismiss}
              /> 
            }
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

const Search = ({ 
  value,
  onChange,
  children,
  placeholder,
  onSubmit
}) => (
    <form className="uk-search uk-search-large" onSubmit={onSubmit}>
        <button type="submit" uk-search-icon=""></button>
        <input
          type="search"
          className="uk-search-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
    {children}
    </form>       

  );

const Table = ({list, onDismiss}) => (
      <table class="uk-table uk-table-hover uk-table-divider">
        <thead>
            <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Number of Comments</th>
                <th>Points</th>
                <th>Created date</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
        { list.map(item =>
          <tr key={item.objectID}>
            <td>
              <a href={item.url}>{item.title}</a>
            </td>
            <td>{item.author}</td>
            <td>{item.num_comments}</td>
            <td>{item.points}</td>
            <td>{item.created_at}</td>
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

export default App;
