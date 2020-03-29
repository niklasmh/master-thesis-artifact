import React from 'react'
import * as firebase from 'firebase/app'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import styled from 'styled-components'

export default function StudentList({ pin, studentIDs, taskIDs }) {
  const [students, loadingStudents, error] = useCollectionData(
    firebase
      .firestore()
      .collection('users')
      .where(firebase.firestore.FieldPath.documentId(), 'in', studentIDs),
    {
      idField: 'id',
    }
  )
  const [tasks] = useCollectionData(
    firebase
      .firestore()
      .collection('tasks')
      .where(firebase.firestore.FieldPath.documentId(), 'in', taskIDs),
    {
      idField: 'id',
    }
  )

  return (
    <StyledStudentTable>
      <StyledStudentList>
        <StyledStudent>
          <RemoveStudentButton></RemoveStudentButton>
          <StudentName>NAVN</StudentName>
          {tasks
            ? tasks.map(task => (
                <Result title={task.title} key={task.id}>
                  {task.title}
                </Result>
              ))
            : null}
        </StyledStudent>

        {loadingStudents ? (
          <tr>
            <td>Laster inn opplegg ...</td>
          </tr>
        ) : error ? null : (
          students.map(c => (
            <Student key={c.id} pin={pin} data={c} tasks={tasks} />
          ))
        )}
      </StyledStudentList>
    </StyledStudentTable>
  )
}

const StyledStudentTable = styled.table`
  width: 100%;
  border-spacing: 0 5px;
`

const StyledStudentList = styled.tbody`
  width: 100%;
`

const StyledStudent = styled.tr`
  margin: 3px 0;
  width: 100%;
  background-color: #0002;
  align-items: center;
  vertical-align: middle;
  font-size: 1.5em;
  border-radius: 6px;

  :first-child {
    text-shadow: 0 4px 8px #0004;
    background: none;

    td {
      background: none;
    }
  }

  td:first-child {
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
  }

  td:last-child {
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
  }
`

const StudentName = styled.td`
  margin: 0;
  text-align: left;
  word-break: break-all;
  hyphens: manual;
  align-self: flex-start;
  font-size: 1em;
  flex: 0 0 320px;
  padding: 6px;
`

const ResultContent = styled.div`
  padding: 6px;
`

const Result = styled.td`
  flex: 0 0 96px;
  padding: 0;
  max-width: 100px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  :nth-child(odd) > ${ResultContent} {
    background: #0002;
    border-radius: 6px;
  }
`

const RemoveStudentButton = styled.td`
  width: 1em;
  margin: 0 0.5em;
  padding-left: 0.5em;
  padding-right: 0.5em;
  color: red;
  cursor: pointer;
`

function Student({ id, tasks, data: { name, tasks: results = {} } }) {
  return (
    <StyledStudent>
      <RemoveStudentButton title={`Fjern ${name} fra klassen`}>
        ✕
      </RemoveStudentButton>
      <StudentName title={name}>{name}</StudentName>
      {tasks
        ? tasks.map(task => (
            <Result title={task.title} key={task.id}>
              <ResultContent>
                {task.id in results ? results[task.id].result + '%' : '-'}
              </ResultContent>
            </Result>
          ))
        : null}
    </StyledStudent>
  )
}
