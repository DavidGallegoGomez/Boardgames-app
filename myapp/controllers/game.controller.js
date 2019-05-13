const mongoose = require('mongoose');
const Game     = require('../models/game.model');
const User     = require('../models/user.model');
const CommentModel  = require('../models/comment.model')
const EventModel  = require('../models/event.model')

module.exports.details = (req, res, next) => {
  const user = req.user
  const id = req.params.id;
  const flashComments = req.flash('comment');
  const comment = (flashComments && flashComments[0]) ? JSON.parse(flashComments[0]): {}
  let userRate = 'none';
  console.log('ID: ', id)

  CommentModel.find( {game: id}, {rate: 1, _id: 0} )
    .then( response => {
      const rates = response.map( obj => obj.rate );
      if (rates.length > 0){
        userRate = (rates.reduce( (a, b) => { return a + b} ) / rates.length).toFixed(2)
      }
    })
    .catch(next)

  Game.findById(id)
    .then( game => 
      EventModel.find({game: id}).sort( { "date": -1 } ).limit(5).populate('game').populate('owner').populate('participants')
        .then( event => CommentModel.find({game: id}).populate('game').populate('user')
          .then( data => res.render('game/details', { title: game.name, game, event, data, comment, user, userRate } ) )
          .catch(next)) )
        .catch(next)
    .catch( next )
};

module.exports.update = (req, res, next) => {
  const id = req.params.id

  Game.findById(id)
    .then( game => res.render('game/form', { title: `${game.name} update`, game } ) )
    .catch( next )
}

module.exports.doUpdate = (req, res, next) => {
  const id = req.params.id

  function renderWithErrors(errors) {
    res.render('game/form', { 
      game: req.body,
      errors: errors,
      title: 'Update game'})
  }

  Game.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    .then(game => {
      if (game) {
        res.redirect(`/games/${game.id}`)
      } else {
        next(createError(404, 'user not found'))
      } 
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) { 
        renderWithErrors(error.errors)
      }
      else {
        next(error);
      }
    })
}

module.exports.addGame = (req, res, next) => {
  res.render('game/create')
}

module.exports.doAddGame = (req, res, next) => {
  const game = new Game(req.body);

  if (req.file) {
    game.imageURL = req.file.secure_url;
  }

  game.save()
    .then( game => res.redirect('/') )
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) { 
        res.render(`game/create`, { 
          user: req.body,
          errors: error.errors
        })}
      else { next(error); }
    })
}

module.exports.add = (req, res, next) => {
  const user = req.user;
  if(req.user.games.filter(item => item.game == req.params.id).length > 0){
    user.games = user.games.map( item => {
      if (item.game == req.params.id){
        item.owned = true;
        item.wished = false;
        return item
      }
      else {
        return item
      }
    })
  }
  else {
    user.games.push({ game: req.params.id, owned: true});
  }
  setTimeout(() => {
  user.save()
    .then(user => res.json(user))
    .catch(next)
  }, 1000)
};

module.exports.wish = (req, res, next) => {
  const user = req.user; 
  if(req.user.games.filter(item => item.game == req.params.id).length > 0){
    user.games = user.games.map( item => {
      if (item.game == req.params.id){
        item.wished = true;
        item.owned = false;
        return item
      }
      else {
        return item
      }
    })
  }
  else {
    user.games.push({ game: req.params.id, wished: true});
  }
  setTimeout(() => {
  user.save()
    .then(user => res.json(user))
    .catch(next)
  }, 1000)
};

module.exports.change = (req, res, next) => {
  const user = req.user; 
  if(req.user.games.filter(item => item.game == req.params.id).length > 0){
    user.games = user.games.map( item => {
      if (item.game == req.params.id){
        item.toChange = true;
        return item
      }
      else {
        return item
      }
    })
  }
  else {
    user.games.push({ game: req.params.id, toChange: true});
  }
  user.save()
    .then(user => res.redirect(`/users/${user.id}`))
    .catch(next)
};

module.exports.removeOwned = (req, res, next) => {
  const user = req.user;
  const newUserGames = []
  user.games.forEach( item => {
    if (item.game == req.params.id){
      item.owned = false;
      if(item.owned === false && item.wished === false && item.toChange === false && item.rated === false && item.created === false){
        
      }
      else {
        newUserGames.push(item)
      }
    }
    else {
      newUserGames.push(item)
    }
  })
  user.games = newUserGames
  user.save()
    .then(user => res.redirect(`/users/${user.id}`))
    .catch(next)
}
module.exports.removeWish = (req, res, next) => {
  const user = req.user;
  const newUserGames = []
  user.games.forEach( item => {
    if (item.game == req.params.id){
      item.wished = false;
      if(item.owned === false && item.wished === false && item.toChange === false && item.rated === false && item.created === false){
        
      }
      else {
        newUserGames.push(item)
      }
    }
    else {
      newUserGames.push(item)
    }
  })
  user.games = newUserGames
  user.save()
    .then(user => res.redirect(`/users/${user.id}`))
    .catch(next)
}
module.exports.removeChange = (req, res, next) => {
  const user = req.user;
  const newUserGames = []
  user.games.forEach( item => {
    if (item.game == req.params.id){
      item.toChange = false;
      if(item.owned === false && item.wished === false && item.toChange === false && item.rated === false && item.created === false){
        
      }
      else {
        newUserGames.push(item)
      }
    }
    else {
      newUserGames.push(item)
    }
  })
  user.games = newUserGames
  user.save()
    .then(user => res.redirect(`/users/${user.id}`))
    .catch(next)
}

module.exports.addComment = (req, res, next) => {
  const id = req.params.id

  const comment = new CommentModel ({
    comment: req.body.comment, 
    rate: req.body.rate,
    game: req.params.id,
    user: req.user.id
  })

  comment.save()
    .then( comment => res.redirect(`/games/${req.params.id}`) )
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        const errors = Object.keys(error.errors).reduce((acc, prop) => {
          acc[prop] = error.errors[prop].message;
          return acc;
        }, {});
        req.flash('errors', JSON.stringify(errors));
        req.flash('comment', JSON.stringify(req.body));
        res.redirect(`/games/${id}`)
      }
      else {
        next(error);
      }
    })
}

