import React, { useState } from "react"
import { useMutation, useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { Box, Button, Checkbox, Typography } from "@mui/material";
import '../assets/global.css'
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// This query is executed at run time by Apollo.
const GET_TODOS = gql`
{
  todos{
    id
    text
    completed
  }
}
`;

const ADD_TODO = gql`
 mutation addTodo($text: String!){
  addTodo(text: $text){
    text
  }
}
`;

const DELETE_TODO = gql`
 mutation delTodo($id: ID!){
   delTodo(id: $id){
     text
   }
 }
`;

const CHECKED_TODO = gql`
  mutation checkedTodo($id: ID!){
    checkedTodo(id: $id){
      text
    }
  }
`;

export default function Home() {
  const [text, setText] = useState('');
  const { loading, error, data } = useQuery(GET_TODOS, { notifyOnNetworkStatusChange: true });
  const [addTodo] = useMutation(ADD_TODO)
  const [delTodo] = useMutation(DELETE_TODO)
  const [checkedTodo] = useMutation(CHECKED_TODO)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text !== "") {
      addTodo({
        variables: { text: text },
        refetchQueries: [{ query: GET_TODOS }]
      }
      )
      setText("")
    }
  }

  const handleDelete = (id) => {
    delTodo({
      variables: { id: id },
      refetchQueries: [{ query: GET_TODOS }]
    })
  }

  const handleChecked = (id) => {
    checkedTodo({
      variables: { id: id },
      refetchQueries: [{ query: GET_TODOS }]
    })
  }

  return (
    <Box sx={{
      width: "100%",
      backgroundColor: "#EEF2FF",
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column'
    }}>

      <Typography variant="h3" color="#707070">Serverless Tasklist</Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          paddingTop: '3rem',
          backgroundColor: '#8843F2',
          borderRadius: '1.3rem',
        }}
        px={10}
        py={5}
        my={5}
        noValidate
      >
        <TextField id="outlined-basic" value={text} onChange={(e) => setText(e.target.value)} required sx={{ width: '100%', marginY: '10px' }} label="Enter Text" variant="outlined" />
        <Button size="large" type="submit" sx={{ backgroundColor: "#8843F2" }} variant="contained">Submit</Button>
      </Box>
      <div className="box">
        {loading && <Typography variant="h3" color="#707070">Loading Client Side Querry...</Typography>}
        {error &&
          <Typography variant="h3" color="#707070">Error: ${error.message}</Typography>}
        {data && data.todos && data.todos.map(todo => (
          <Box
            key={todo.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            {todo.completed ? (
              <Checkbox disabled defaultChecked />
            ) : (
              <Checkbox onClick={() => handleChecked(todo.id)} />
            )}
            <Box sx={{
              background: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: "20rem",
              borderRadius: '10px'
            }}
              p={2}
              marginY={2}
            >
              <Typography variant="body1">{todo.text}</Typography>
              <Button>
                <EditIcon color="secondary" />
              </Button>
              <Button
                onClick={() => handleDelete(todo.id)}
              >
                <DeleteIcon color="primary" />
              </Button>

            </Box>
          </Box>
        ))}
      </div>
    </Box>
  );

}