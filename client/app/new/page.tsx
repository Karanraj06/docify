// Page for new Project

import React from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { GetTokenParams } from 'next-auth/jwt';

import { db } from '@/lib/db';
import Wrapper from '@/components/wrapper';
import Navbar from '@/components/Navbar';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { URLSearchParams } from 'url';

interface GithubRepository {
  id: string;
  name: string;
  clone_url: string;
}

const GITHUB_API_BASE_URL = 'https://api.github.com';

async function refresh_access_token(refresh_token:string|undefined){
  try{
    const uri = 'https://github.com/login/oauth/access_token';

    const response = await axios.post(uri, {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      grant_type:'refresh_token',
      refresh_token:refresh_token,
    });

    const parsed_data = new URLSearchParams(response.data);
    const new_access_token = parsed_data.get('access_token');
    const new_refresh_token = parsed_data.get('refresh_token');

    if(!new_access_token || !new_refresh_token){
      return undefined;
    }

    await db.user.update({
      where:{
        username:'Yashasv-Prajapati'
      },
      data:{
        github_access_token: new_access_token,
        github_refresh_token: new_refresh_token
      }

    })
    return new_access_token;

  }catch(err){
    console.log(err)
    return undefined;
  }
}

async function get_repositories(
  github_access_token: string | undefined
): Promise<Array<GithubRepository> | undefined> {
  const user = await db.user.findUnique({
    where: {
      username: 'Yashasv-Prajapati',
    },
    select: {
      github_access_token: true,
      github_installation_id: true,
      github_refresh_token:true
    },
  });
  const installation_id = user?.github_installation_id;
  let access_token = user?.github_access_token;

  const requestOptions = {
    headers: {
      Authorization: `token ${access_token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Your-App',
      'X-GitHub-Installation-Id': installation_id,
    },
  };

  console.log("Access token ", access_token);
  console.log("Installation id ", installation_id);

  const uri = `${GITHUB_API_BASE_URL}/user/repos`;

  try {
    const response: AxiosResponse | undefined | string = await axios.get(uri, requestOptions)
    .catch(async()=>{
      access_token = await refresh_access_token(user?.github_refresh_token);
      return access_token;
    });
    console.log(uri, requestOptions, access_token)
    if(!response){
      return [];
    }

    if(typeof response === 'string'){
      requestOptions.headers.Authorization = `token ${access_token}`;
      const new_response =  await axios.get(uri, requestOptions);
      return new_response.data;
    }

    return response.data;

  } catch (err) {
    console.log(err)
    return [];
  }


}

export default async function Page() {
  // const user = getCurrentUser();
  const github_access_token = process.env.GITHUB_ACCESS_TOKEN;

  const data = await get_repositories(github_access_token);

  return (
    <div className="overflow-hidden bg-[#1b222f]">
      <Navbar />
      <Wrapper>


        {/* <div>Import Github Repository</div> */}
        <div className='m-5' >
          <Card className="w-5/6 bg-[#1b222f] text-white">
            <CardHeader>
              <CardTitle>Import Github Repository</CardTitle>
              <CardDescription>Import your repositories to start using docify</CardDescription>
            </CardHeader>
            <CardContent>

              <form >
                <div className="grid w-1/2 items-center gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Github Username</Label>
                    <Input className='bg-[#1b222f]' type="email" id="email" placeholder={'username'} />
                  </div>
                </div>
              </form>

              <div>
                { data && data.length>0
                 ?
                  data.map((repo: { name: string, clone_url: string, id:string }, index: number) => (
                  <div
                    key={repo.id}
                    className="m-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                  >
                    <span className="flex size-2 translate-y-1 rounded-full bg-sky-500" />
                    <div className='flex flex-row items-center'>
                      <div className="w-3/4 space-y-2">
                        <p className="text-m font-medium leading-none">
                          {repo.name}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {repo.clone_url}
                        </p>


                      </div>
                      <div className=''>
                        <Button variant="outline" className=' bg-[#1b222f] text-white'>Import</Button>
                      </div>
                    </div>
                  </div>
                ))
                : null}
              </div>

            </CardContent>
          </Card>
        </div>


      </Wrapper>
    </div>
  );
}
