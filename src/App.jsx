import React, { useState, useEffect, Fragment } from 'react';
import ReactDOM from 'react-dom';
import regeneratorRuntime from "regenerator-runtime"; // this got me some time to google it, it's for async calls
//remove yarn.lock and yarn start again, it's babel issue
import styled from 'styled-components';
import Header from './Header.jsx';
import {HiOutlineArchiveBoxArrowDown} from 'react-icons/hi2';
import {MdRestore} from 'react-icons/md';
import {VscCallIncoming} from 'react-icons/vsc';
import {VscCallOutgoing} from 'react-icons/vsc';

const Record = styled.div`
  padding: 15px;
  border: 1px solid #a5a4a42b;
  border-radius: 12px;
  margin: 10px 0px;
  cursor: pointer;
  background: white;
  color: #2a2a2acc;
    font-weight: 500;
  display: ${props => {
    if(props.tab === 'calls'){
      if(props.record.is_archived === true){
        return 'none';
      }
    } else if(props.tab === 'archives'){
      if(props.record.is_archived === false) {
        return 'none';
      }
    }
    
  }};
`;

const DateRow = styled.div`
  text-align: center;
  color: #a19f9fc2;
  font-weight: 700;
`;

const SimpleRecord = styled.div`
  display: ${props => props.expanded === props.record.id ? 'none' : 'flex'};
  justify-content: space-between;
`;

const TimeSection = styled.div`
color: #a19f9fc2;
font-weight: 700;
`;

const DetailedRecord = styled.div`
  display: ${props => props.expanded === props.record.id ? 'initial' : 'none'};
`;

const RecordContainer = styled.div`
padding: 20px;
  background: #c4c2c217;
  position: relative;
  top: 45px;
  overflow-y: scroll;
  height: 560px;
  display: ${props => props.loading === true ? 'none' : ''};
`;

const LoadingContainer = styled.div`
display: ${props => props.loading === true ? 'flex' : 'none'};
  background: #c4c2c217;
  top: 40px;
  height: 100%;
  justify-content: center;
  align-items: center;
  position: relative;
`

const ButtonGroup = styled.div`
display: flex;
position: absolute;
left: 229px;
top: 20px;
`;

const CallsButton = styled.div`
  width: 40px;
  height: 60px;
  cursor: pointer;
  color: ${props => props.tab === 'calls' ? 'initial' : ' #a19f9fc2'};
  font-weight: 700;
  border-bottom: ${props => props.tab === 'calls' ? '3px solid orange' : 'initial'};
  display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 10px;
`;

const ArchivesButton = styled.div`
  width: 60px;
  height: 60px;
  cursor: pointer;
  color: ${props => props.tab === 'archives' ? 'initial' : ' #a19f9fc2'};
  font-weight: 700;
  border-bottom: ${props => props.tab === 'archives' ? '3px solid orange' : 'initial'};
  display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 10px;
`;

const ArchiveButton = styled.div`
position: absolute;
right: 20px;
padding: 5px;
margin-right: 10px;
`;

const RecordMessage = styled.div`
padding: 0px 5px;
`;

const DetailedEntry = styled.div`
text-transform: capitalize;
`;
const ResetAll = styled.div`
display: ${props => props.tab === 'archives' ? '' : 'none'};
position: absolute;
top: 0px;
right: 0px;
cursor: pointer;
padding: 10px;
margin-right: 20px;
`;

const App = () => {
  const [fetched, setFetched] = useState(false);
  const [allCalls, setAllCalls] = useState([]);
  const [expanded, setExpanded] = useState('');
  const [tab, setTab] = useState('calls');
  const [loading, setLoading] = useState(false);

  const fetchCalls = async()=>{
    setLoading(true);
    try {
      const rawResponse = await fetch('https://charming-bat-singlet.cyclic.app/https://cerulean-marlin-wig.cyclic.app/activities');
      const res = await rawResponse.json();
      //sort and group array into date
      let t = {};
      res.sort((a,b) => (new Date(b.created_at)).getTime() - (new Date(a.created_at)).getTime());
      let g = '';
      res.forEach((record)=>{
        if(record.created_at.split('T')[0] != g){
          g = record.created_at.split('T')[0];
          t[g] = [record];
        } else {
          t[g].push(record);
        }
      });
      console.log(t);
      setFetched(true);
      setAllCalls(t);
      setLoading(false);
    } catch(error){
      console.log(error);
    }
  }

  const patchRecord = async (recordId, currentTab)=> {
    setLoading(true);
    try {
      const rawResponse = await fetch(`https://charming-bat-singlet.cyclic.app/https://cerulean-marlin-wig.cyclic.app/activities/${recordId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          is_archived: currentTab === 'calls' ? true : false,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      fetchCalls();
    } catch(error){
      console.log(error);
    }
  }

  const resetRecords = async () => {
    setLoading(true);
    try {
      const rawResponse = await fetch(`https://charming-bat-singlet.cyclic.app/https://cerulean-marlin-wig.cyclic.app/reset`, {
        method: 'PATCH',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      fetchCalls();
    } catch(error){
      console.log(error);
    }
  }

  useEffect(() => {
    if(!fetched) {
        fetchCalls();
    }
    console.log('initial fetch');
  }, []);

  const displayField = ['direction', 'from', 'to', 'via', 'duration', 'call_type', 'created_at'];
  const phoneNumberField = ['from', 'to', 'via'];

  return (
    <div className='container'>
      <Header/>
      <ButtonGroup>
        <CallsButton tab={tab} onClick={()=>setTab('calls')}>Calls</CallsButton>
        <ArchivesButton tab={tab} onClick={()=>setTab('archives')}>Archives</ArchivesButton>
      </ButtonGroup>
      <LoadingContainer className='loading-container' loading={loading}><div /><div /><div /><div /></LoadingContainer>
      <RecordContainer className='record-container' loading={loading}>
        <ResetAll tab={tab} className='reset-all' title='restore all' onClick={()=>resetRecords()}><MdRestore /></ResetAll>
        {
          
          Object.keys(allCalls).map((key, i)=>(
            <Fragment>
              <DateRow className='date-row'>{`${key}`}</DateRow>
              {
                allCalls[key].map((record)=>(
                    <Record 
                      onClick={()=>{expanded === record.id ? setExpanded('') : setExpanded(record.id)}}
                      className={expanded === record.id ? 'detailed-record' : 'simple-record'}
                      tab={tab}
                      record={record}
                    >
                      <SimpleRecord expanded={expanded} record={record}>
                      <div style={{display: 'flex'}}>
                        {
                        record.direction ?
                          record.direction == 'inbound' ? <Fragment><VscCallIncoming /><RecordMessage>{`${record.from?' +'+record.from.toString().match(/.{1,2}/g).join(' '):'Error'} (${record.call_type})`}</RecordMessage></Fragment> : <Fragment><VscCallOutgoing /><RecordMessage>{`${record.to?' +'+record.from.toString().match(/.{1,2}/g).join(' '):'Error'} (${record.call_type})`}</RecordMessage></Fragment>
                          :
                          `Error (see detail)`
                        }
                      </div>
                      <TimeSection>{`${(new Date(record.created_at)).getHours()<10 ? '0' : ''}${(new Date(record.created_at)).getHours()}:${(new Date(record.created_at)).getMinutes()<10 ? '0' : ''}${(new Date(record.created_at)).getMinutes()}`}</TimeSection>
                      </SimpleRecord>
                      <DetailedRecord expanded={expanded} record={record}>
                        <ArchiveButton 
                          className='archiveButton' title='archive'
                          onClick={()=>patchRecord(record.id, tab)}
                        >
                          <HiOutlineArchiveBoxArrowDown style={{display: tab === 'archives' ? 'none' : ''}} />
                          <MdRestore  style={{display: tab === 'calls' ? 'none' : ''}} />
                        </ArchiveButton>
                        {
                          Object.keys(record).map((key, i)=>(
                             displayField.includes(key) ?
                                key === 'duration' ?
                                  <DetailedEntry>{`${key.split('_').join(' ')}: ${record[key]>59 ? Math.ceil(record[key]/60)+' minutes' : record[key]+' seconds' }`}</DetailedEntry>
                                  :
                                  key === 'created_at' ?
                                    <DetailedEntry>{`${key.split('_').join(' ')}: ${(new Date(record.created_at)).getHours()<10 ? '0' : ''}${(new Date(record.created_at)).getHours()}:${(new Date(record.created_at)).getMinutes()<10 ? '0' : ''}${(new Date(record.created_at)).getMinutes()}`}</DetailedEntry>
                                    :
                                    phoneNumberField.includes(key) ? 
                                      <DetailedEntry>{`${key.split('_').join(' ')}: +${record[key].toString().match(/.{1,2}/g).join(' ')}`}</DetailedEntry>
                                      :
                                      <DetailedEntry>{`${key.split('_').join(' ')}: ${record[key]}`}</DetailedEntry>
                              :
                              null
                          ))
                        }
                      </DetailedRecord>
                    </Record>
                ))
              }
            </Fragment>
          ))
        }
      </RecordContainer>
    </div>
  );
};

ReactDOM.render(<App/>, document.getElementById('app'));

export default App;
