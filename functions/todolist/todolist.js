const { ApolloServer, gql } = require('apollo-server-lambda')
const faunadb = require('faunadb');
const q = faunadb.query;

const typeDefs = gql`
  type Query {
    todos: [Todo]
  }

  type Mutation{
    addTodo(text: String!): Todo
    delTodo(id: ID!): Todo
    checkedTodo(id: ID!): Todo
  }

  type Todo{
    id: ID!
    text: String!
    completed: Boolean!
  }

`


const client = new faunadb.Client({
  secret: process.env.FAUNADB_ADMIN_SECRET
})

const resolvers = {
  Query: {
    todos: async () => {
      try{
        const results = await client.query(
          q.Map(
            q.Paginate(q.Match(q.Index('todo_by_text'))),
            q.Lambda(x => q.Get(x))
          )
        )
        console.log(results, 'data');
        const data = results.data.map(d => {
          return{
            id: d.ref.id,
            text: d.data.text,
            completed: d.data.completed
          }
        })
        return data;
      }catch(err){
        console.log(err, 'error');
        return err.toString()
      }
    },
  },
  Mutation:{
    addTodo: async(_, {text}) => {
      try{
        const results = await client.query(
        q.Create(q.Collection('todos'),
          {
            data: {text: text, completed: false}
          }
        )
      );
      return results.data;
      }catch(err){
        return err.toString()
      }
    },
    delTodo: async(_, {id}) => {
      try{
        const results = await client.query(
          q.Delete(q.Ref(q.Collection('todos'), id))
        );
        return results.data;
      }catch(err){
        return err.toString()
      }
    },
    checkedTodo: async(_, {id}) => {
      try{
        const results = await client.query(
          q.Update(q.Ref(q.Collection('todos'), id),
           {
             data: {completed: true}
           }
          )
        )
        return results.data
      }catch(err){
        return err.toString()
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const handler = server.createHandler()

module.exports = { handler }
