import React, { Component } from "react";
import "./App.css";
// import UIkit from 'uikit';
// import Icons from 'uikit/dist/js/uikit-icons';

const DEFAULT_QUERY = 'redux',
      DEFAULT_HPP = '20',

      PATH_BASE = 'https://hn.algolia.com/api/v1',
      PATH_SEARCH = '/search',
      PARAM_SEARCH = 'query=',
      PARAM_PAGE = 'page=',
      PARAM_HPP = 'hitsPerPage='

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
    const { hits, page } = result;
    const oldHits = page !==0 
            ? this.state.result.hits
            : [];
    const updatedHits = [
              ...oldHits,
              ...hits
          ];

    this.setState({ 
      result: { hits: updatedHits, page }
     });
  }

  fetchSearchTopStories (searchTerm, page = 0) {
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
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
    const { searchTerm, result} = this.state,
          page = (result && result.page) || 0;
    
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
          <div className="interactions">
            <Button className="uk-margin-bottom uk-button-primary" onClick={() => {this.fetchSearchTopStories(searchTerm, page + 1)}} >
              More
            </Button>
          </div>
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
