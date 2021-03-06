var path = require('path');
var assert = require('assert');
var request = require('supertest');
var app = require('../index');
var User = require('../lib/mongo').User;

describe('signup',function () {
    describe('POST /signup',function () {
        var agent = request.agent(app);//persist cookie when redirect
        beforeEach(function (done) {
            User.create({
                name: 'aaa',
                password: '123456',
                avatar: '',
                gender: 'x',
                bio: ''
            })
                .exec()
                .then(function () {
                    done();
                })
                .catch(done);
        });
        afterEach(function (done) {
            //清空user表
            User.remove({})
                .exec()
                .then(function () {
                    done();
                })
                .catch(done);
        });
        //用户名错误信息
        it('wrong name',function (done) {
            agent
                .post('/signup')
                .type('form')
                .attach('avatar',path.join(__dirname,'avatar.png'))
                .field({name: ''})
                .redirects()
                .end(function (err,res) {
                    if (err){
                        return done(err);
                    }
                    assert(res.text.match(/名字请限制在1-10个字符/));
                    done();
                })
        });
        //性别错误信息
        it('wrong gender',function (done) {
            agent
                .post('/signup')
                .type('form')
                .attach('avatar',path.join(__dirname,'avatar.png'))
                .field({name: 'nsbmw',gender: 'a'})
                .redirects()
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert(res.text.match(/性别只能是m、f或者x/));
                    done();
                })
        });
        // 用户名被占用的情况
        it('duplicate name', function(done) {
            agent
                .post('/signup')
                .type('form')
                .attach('avatar', path.join(__dirname, 'avatar.png'))
                .field({ name: testName1, gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
                .redirects()
                .end(function(err, res) {
                    if (err) return done(err);
                    assert(res.text.match(/用户名已被占用/));
                    done();
                });
        });

        // 注册成功的情况
        it('success', function(done) {
            agent
                .post('/signup')
                .type('form')
                .attach('avatar', path.join(__dirname, 'avatar.png'))
                .field({ name: testName2, gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
                .redirects()
                .end(function(err, res) {
                    if (err) return done(err);
                    assert(res.text.match(/注册成功/));
                    done();
                });
        });
    });
});