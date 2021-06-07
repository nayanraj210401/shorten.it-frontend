
#### Live Webapp: [SHORTEN.IT](https://shorten-it.netlify.app/) 
-------------------------------------------
# Frontend (hosted on netlify)

- To run the frontend 
  + Step 1 : To install all the npm packages`npm i` or `npm install` 
  + Step 2 : To Run the frontend `npm start`

# Queries for GraphQL
 - all the queries are in landers.jsx
 ~~~
    const SEARCH_URL = gql` 
           query($fullUrl: String!){
                urls(url : $fullUrl){
                  urlHash
                }
              }
        `;
        const GET_ALL_URLS = gql`
        {
                urls {
                  id
                  fullUrl
                  urlHash
                  clicks
                  createdAt
                }
              }
              
        `;
        const CREATE_SHORTENED_LINK = gql`
        mutation ($fullUrl: String!){
                createUrl(fullUrl: $fullUrl) {
                url {
                        id
                        fullUrl
                        urlHash
                        clicks
                        createdAt
                }
            }
        }
        `;
~~~


# Backend (hosted on heruko)
- The Backend is Basically a Django backend

## To run the backend 
  + Step 1 : Install all the packages required `pip install` 
  + Step 2 : make sure to configure your Database 
  + Step 3 : To run Backend `python manage.py runserver`

- To make you understand the backend I am going put snippets of Code below 

Step 1 : First we have to have a end Point for GraphQL so that the client can make queries and interact
 
- so using `from graphene_django.views import GraphQLView` using graphQL lets make it and also we have to use `from django.views.decorators.csrf import csrf_exempt` for CORS
 In Urls.py 
- `path('graphql/', csrf_exempt(GraphQLView.as_view(graphiql = True))),` for graphQL GUI
 
Step 2: Make a new App using command `python manage.py startapp <your app name>`

Step 3: make a Model for URLS to be saved 
#### fields for DB
- full_urls
- url_hash
- clicks
- created_at

As we are using a MD5 hashing for generating the unique hash (if the use gives the same link again so there might be colision in our DB so to avoid it generate the hash, if find the hash same present in db just return the same in the client side.)

##### Imports
`
from django.core.validators import URLValidator, 
from hashlib import md5
`
~~~
 def save(self, *args, **kwargs):
        if not self.id:
            self.url_hash = md5(self.full_url.encode()).hexdigest()[:10]
        validate = URLValidator()
        try:
            validate(self.full_url)
        except ValidationError as e:
            raise GraphQLError('invalid url')
        
        return super().save(*args, **kwargs)
~~~
you can see above md5(string.encode()).hexdigest()[:10] we are slicing the first hash key will be the same.

Whole file looks like 
~~~
from django.db import models
from hashlib import md5
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
# from django_graphql_ratelimit import ratelimit
from graphql import GraphQLError
# Create your models here.
class URL(models.Model):
    full_url = models.URLField(unique=True)
    url_hash = models.URLField(unique=True)
    clicks = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def clicked(self):
        self.clicks += 1
        self.save()
        
   
    def save(self, *args, **kwargs):
        if not self.id:
            self.url_hash = md5(self.full_url.encode()).hexdigest()[:10]
        validate = URLValidator()
        try:
            validate(self.full_url)
        except ValidationError as e:
            raise GraphQLError('invalid url')
        
        return super().save(*args, **kwargs)
~~~

Now Lets make a Schema for GraphQL to Query 

Step 4: Make a Schema.py inside your App
- we have make query and mutation for GraphQL with the db 

First lets do with making a mutation in GraphQL
`import graphene`
so for a mutation we using graphene.Mutation
~~~
class CreateURL(graphene.Mutation):
    url = graphene.Field(URLType)
    class Arguments:
        full_url = graphene.String()
    @ratelimit(key = 'ip', rate= '10/m' ,block = True)
    def mutate(self, info, full_url):
            url = URL(full_url = full_url)
            url.save()
            return CreateURL(url = url)
~~~

its a simple mutation for graphQL you can check out this : https://www.howtographql.com/graphql-python/3-mutations/

Remember we have to check if an urls is already in a DB or not 
So we have make a Query in graphQL
~~~
class Query(graphene.ObjectType):
    urls = graphene.List(URLType, url = graphene.String(),first = graphene.Int(), skip = graphene.Int())
    
    def resolve_urls(self,info, url = None, **kwargs):
        queryset = URL.objects.all()
        if(url):
            _filter = Q(full_url__icontains=url)
            queryset = queryset.filter(_filter)
        return queryset
~~~

if your making a list of urls so you have pagination with a query 

~~~
class Query(graphene.ObjectType):
    urls = graphene.List(URLType, url = graphene.String(),first = graphene.Int(), skip = graphene.Int())

    def resolve_urls(self,info, url = None, first = None , skip = None , **kwargs):
        queryset = URL.objects.all()

        if(url):
            _filter = Q(full_url__icontains=url)
            queryset = queryset.filter(_filter)
        
        if(first):
            queryset = queryset[:first]
        
        if(skip):
            queryset = queryset[skip:]
        return queryset
~~~
> Make Sure have a ratelimiter for mutation because anyone can just spam on the link field using this we can limit it. As there is no auth. 

At last, lets make the views.py file 

before adding it in urls.py in your project add this 
also import root from views in the app
` path('<str:url_hash>/',root,name='root'),`

views.py
~~~
from django.shortcuts import render, redirect , get_object_or_404
from .models import URL

def root(request,url_hash):
    url = get_object_or_404(URL, url_hash = url_hash)
    url.clicked()
    return redirect(url.full_url)
~~~
# References
+ GraphQL: https://www.howtographql.com/
+ Digital Ocean Blog : https://www.digitalocean.com/community/tutorials/how-to-create-a-url-shortener-with-django-and-graphql
+ ReactJS : https://reactjs.org/docs/getting-started.html
