import React, { useState } from 'react';
import AddUser from './AddUser';
import UserList from './UserList';

const UserManage = () => {
  const [active, setActive] = useState('create');

  return (
    <div className="p-4">
        <div className="flex gap-3 mb-4">
            <button
                onClick={() => setActive('create')}
                className={`px-6 py-2.5 text-xs rounded-3xl shadow-lg flex items-center justify-center 
                ${
                    active === 'create'
                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
            >
                Create New User
            </button>

            <button
                onClick={() => setActive('list')}
                className={`px-6 py-2.5 text-xs rounded-3xl shadow-lg flex items-center justify-center 
                ${
                    active === 'list'
                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
            >
                List All Users
            </button>
        </div>
        
      <div className="">
        {active === 'create' ? <AddUser /> : <UserList />}
      </div>
    </div>
  );
};

export default UserManage;
