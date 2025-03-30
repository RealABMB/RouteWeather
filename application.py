from datetime import datetime
from flask import Flask, render_template, url_for, request, redirect
from flask_sqlalchemy import SQLAlchemy
application = Flask(__name__)

application.config['SQLALCHEMY_DATABASE_URI'] = ''
db = SQLAlchemy(application)


class ContactMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=True)
    email = db.Column(db.String(200), nullable=False)
    message = db.Column(db.String(1000), nullable=False)
    problem = db.Column(db.String(200), nullable=True)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

@application.route('/')
def home():
    return render_template('home.html')


@application.route('/contact', methods=['POST', 'GET'])
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


@application.route('/improve', methods=['POST', 'GET'])
def improve():
    if request.method == "POST":
        contact_message_info = ContactMessage(
            email=request.form['email'], message=request.form['message'])
        try:
            db.session.add(contact_message_info)
            db.session.commit()
            return redirect(request.referrer)
        except:
            return render_template('contact.html')
    else:
        return redirect(request.referrer)


@application.route('/report', methods=['POST', 'GET'])
def report():
    if request.method == "POST":
        contact_message_info = ContactMessage(
            problem=request.form['problem'], email=request.form['email'], message=request.form['message'])
        try:
            db.session.add(contact_message_info)
            db.session.commit()
            return redirect(request.referrer)
        except:
            return "There was an error adding the message."
    else:
        return redirect(request.referrer)


@application.route('/about')
def about():
    return render_template('about.html')


@application.route('/software')
def software():
    return render_template('software.html')


@application.route('/map')
def map():
    return render_template('map.html')


if __name__ == "__main__":
    application.run(host="0.0.0.0", port=3600)

