const Sauce = require("../models/sauce");
const fs = require("fs");

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject.userId;

  const dataToSanitize = ["name", "manufacturer", "description", "mainPepper"];
  dataToSanitize.forEach(data => sauceObject[data] = sauceObject[data].replaceAll(/<\/?[^>]+(>|$)/gi, ""));

  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce created !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.updateSauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  delete sauceObject.userId;

  const upload = req.file ? true : false;

  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (sauce.userId != req.auth.userId) {
      res.status(403).json({ message: "Unauthorized request." });
    } else {
      if (upload) {
        const formerFileName = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${formerFileName}`, () => {});
      }
      Sauce.updateOne(
        { _id: req.params.id },
        {
          ...sauceObject,
          userId: req.auth.userId,
        }
      )
        .then(() => res.status(200).json({ message: "Sauce updated." }))
        .catch((error) => res.status(500).json({ error }));
    }
  });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(403).json({ message: "Unauthorized request." });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Sauce deleted." }))
            .catch((error) => res.status(500).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const userId = req.body.userId;
      const like = req.body.like;
      let likes = sauce.likes;
      let dislikes = sauce.dislikes;
      let usersLiked = sauce.usersLiked;
      let usersDisliked = sauce.usersDisliked;

      if (like === 1 && !usersLiked.includes(userId)) {
        likes++;
        usersLiked.push(userId);
      } else if (like === 0) {
        if (usersLiked.includes(userId)) {
          likes--;
          usersLiked = usersLiked.filter((value) => value != userId);
        } else if (usersDisliked.includes(userId)) {
          dislikes--;
          usersDisliked = usersDisliked.filter((value) => value != userId);
        }
      } else if (like === -1 && !usersDisliked.includes(userId)) {
        dislikes++;
        usersDisliked.push(userId);
      }
      Sauce.updateOne(
        { _id: req.params.id },
        {
          ...req.body,
          userId: req.body.userId,
          likes: likes,
          dislikes: dislikes,
          usersDisliked: usersDisliked,
          usersLiked: usersLiked,
        }
      )
        .then(res.status(200).json({ message: "Sauce updated." }))
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
