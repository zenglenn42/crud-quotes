class Controller {
  constructor() {
    this.delegate(document, "submit", ".create-form", this.createQuote.bind(this));
    this.delegate(document, "click", ".delquote", this.deleteQuote.bind(this));
    this.delegate(document, "submit", ".update-form", this.updateQuote.bind(this));
  }

  // https://stackoverflow.com/questions/30880757/javascript-equivalent-to-on
  delegate(el, evt, sel, handler) {
    el.addEventListener(evt, function(event) {
        let t = event.target;
        while (t && t !== this) {
          if (t.matches(sel)) {
            handler.call(t, event);
          }
          t = t.parentNode;
        }
    });
  };

  createQuote(event) {
    event.preventDefault();

    const author = document.querySelector("#auth").value.trim();
    const quote = document.querySelector("#quo").value.trim();

    const newQuote = {
      'author': author,
      'quote': quote
    }

    const postConfig = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newQuote)
    }

    fetch("/api/quotes", postConfig)
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          return Promise.reject({
              status: response.status,
              statusText: response.statusText
          })
        }
      })
      .then(jsObj => {
        location.reload();
        console.log("jsObj = ", jsObj);
      })
      .catch(error => {
        console.log("Error status:", error.status);
        console.log("Error text:", statusText);
      }
    );
  }

  deleteQuote(event) {
    event.preventDefault();

    const delButtonEl = event.target;
    const quoteId = delButtonEl.getAttribute("data-id");
    const delConfig = {
      method: 'delete'
    }

    fetch(`/api/quotes/${quoteId}`, delConfig).then(() => {
      location.reload();
    });
  }

  updateQuote(event) {
    event.preventDefault();

    const author = document.querySelector("#auth").value.trim();
    const quote = document.querySelector("#quo").value.trim();
    const formEl = event.target;
    const quoteId = formEl.getAttribute("data-id");
    const updateQuote = {
      'author': author,
      'quote': quote
    };

    const updateConfig = {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateQuote)
    }

    fetch(`/api/quotes/${quoteId}`, updateConfig)
      .then(response => {
        if (response.ok) {
          location.assign("/");
        } else {
          return Promise.reject({
              status: response.status,
              statusText: response.statusText
          })
        }
      })
      .catch(error => {
        console.log("Error status:", error.status);
        console.log("Error text:", error.statusText);
      })
  }

}