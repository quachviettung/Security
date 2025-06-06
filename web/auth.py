from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for

auth = Blueprint('auth', __name__)

users = {}

@auth.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username in users and users[username] == password:
            session['username'] = username
            return jsonify({'status': 'success', 'message': 'Dang nhap thanh cong'})
        return jsonify({'status': 'error', 'message': 'Ten dang nhap hoac mat khau khong dung'})
    return render_template('auth.html', page='login')

@auth.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username in users:
            return jsonify({'status': 'error', 'message': 'Ten dang nhap da ton tai'})
        users[username] = password
        session['username'] = username
        return jsonify({'status': 'success', 'message': 'Dang ky thanh cong'})
    return render_template('auth.html', page='register')

@auth.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('auth.login'))