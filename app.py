from flask import Flask, render_template, url_for, request, redirect
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///contact.db'
app.config['SQLALCHEMY_BINDS'] = {
    'improve': 'sqlite:///improve.db', 'report': 'sqlite:///report.db'}
db = SQLAlchemy(app)


class ContactMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), nullable=False)
    message = db.Column(db.String(1000), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)


class ImproveMessage(db.Model):
    __bind_key__ = 'improve'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(200), nullable=True)
    message = db.Column(db.String(1000), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)


class ReportMessage(db.Model):
    __bind_key__ = 'report'
    id = db.Column(db.Integer, primary_key=True)
    problem = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), nullable=True)
    message = db.Column(db.String(1000), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/contact', methods=['POST', 'GET'])
def contact():
    if request.method == "POST":
        contact_message_info = ContactMessage(
            name=request.form['name'], email=request.form['email'], message=request.form['message'])
        try:
            db.session.add(contact_message_info)
            db.session.commit()
            return render_template('contact.html')
        except:
            return "There was an error adding the message."
    else:
        return render_template('contact.html')


@app.route('/improve', methods=['POST', 'GET'])
def improve():
    if request.method == "POST":
        contact_message_info = ImproveMessage(
            email=request.form['email'], message=request.form['message'])
        try:
            db.session.add(contact_message_info)
            db.session.commit()
            return redirect(request.referrer)
        except:
            return render_template('contact.html')
    else:
        return redirect(request.referrer)


@app.route('/report', methods=['POST', 'GET'])
def report():
    if request.method == "POST":
        contact_message_info = ReportMessage(
            problem=request.form['problem'], email=request.form['email'], message=request.form['message'])
        try:
            db.session.add(contact_message_info)
            db.session.commit()
            return redirect(request.referrer)
        except:
            return "There was an error adding the message."
    else:
        return redirect(request.referrer)


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/software')
def software():
    return render_template('software.html')


@app.route('/map')
def map():
    return render_template('map.html')


if __name__ == "__main__":
    app.run(debug=True)
