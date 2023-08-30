const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const TOKEN_KEY = process.env.AUTH_SECRET_KEY;

// 회원가입
const addUser = async (req, res) => {
  try {
    // 파일 업로드 처리
    let url;
    if (req.file) {
      url = req.file.location;
    }

    // 전송된 데이터 처리
    const dataObject = JSON.parse(req.body.data);

    // 유저 이름 중복 검사
    const existUser = await User.findOne({
      where: {
        username: dataObject.username,
      },
    });

    if (existUser) {
      res.status(409).send('중복된 이름이 존재합니다.');
      return;
    }

    // 비밀번호 암호화
    const hashPassword = await bcrypt.hash(dataObject.password, 10);

    // 유저 생성
    const createdUser = await User.create({
      username: dataObject.username,
      password: hashPassword,
      profileDescription: dataObject.profileDescription,
    }).catch((err) => console.log(err));

    // 파일이 전송되었을 경우에만 프로필 이미지 URL 업데이트
    if (url) {
      await User.update(
        { profileImage: url },
        { where: { id: createdUser.id } }
      );
    }
    res.status(201).send(createdUser);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// 로그인
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 사용자이름이 DB에 존재하는지 혹인
    const existUser = await User.findOne({
      where: {
        username,
      },
    });
    if (!existUser) {
      res.status(404).send('존재하지 않는 사용자입니다.');
      return;
    }
    // 비밀번호 대조
    const hashedPassword = existUser.password;
    if (await bcrypt.compare(password, hashedPassword)) {
      // 로그인 성공 및 토큰 발급
      const token = jwt.sign(
        { id: existUser.id, username: existUser.username },
        TOKEN_KEY
      );
      res.status(200).json({
        token,
        userInfo: {
          username: existUser.username,
          profileImage: existUser.profileImage,
          profileDescription: existUser.profileDescription,
        },
      });
    } else {
      res.status(401).send('비밀번호를 다시 확인해주세요.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// 토큰 유효성 검사
const validateToken = async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization.split(' ')[1];
  try {
    const decodedToken = jwt.verify(token, TOKEN_KEY);
    if (decodedToken) {
      res.status(200).send('토큰 유효성 검사 통과');
    }
  } catch (err) {
    console.log(err); // 에러 출력
    if (err instanceof jwt.JsonWebTokenError) {
      // 에러 타입 검사
      res.status(401).send('토큰 유효성 검사 불합격');
    }
  }
};

module.exports = {
  addUser,
  loginUser,
  validateToken,
};
