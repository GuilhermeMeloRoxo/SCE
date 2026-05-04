                 
profileContainer.innerHTML = `<div class="flex flex-col items-center gap-6 text-center">
                            <!-- <img src="CAMINHO_DA_FOTO_DE_PERFIL" alt="Logo" class="h-28 w-28 rounded-full bg-slate-200"> -->
                            <div class="h-28 w-28 rounded-full bg-slate-200"></div>
                            <div>
                                <p class="text-xl font-semibold text-slate-900">${data.nome || 'Nome não informado'}</p>
                                <p class="text-sm text-slate-500">${data.email || 'Email não informado'}</p>
                            </div>
                        </div>

                        <div class="mt-8 space-y-4">
                            <div class="rounded-[24px] bg-white p-5 shadow-sm">
                                <p class="text-xs uppercase tracking-[0.22em] text-sky-700">Curso</p>
                                <p class="mt-3 text-base font-medium text-slate-900">${data.formacao.curso || 'Curso não informado'}</p>
                            </div>
                            <div class="rounded-[24px] bg-white p-5 shadow-sm">
                                <p class="text-xs uppercase tracking-[0.22em] text-sky-700">Formado em</p>
                                <p class="mt-3 text-base font-medium text-slate-900">${data.formacao.termino || 'Data de término não informada'}</p>
                            </div>
                        </div>
`;  

githubContainer.innerHTML = `
                            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Contribuições Recentes - GitHub</p>
                                </div>
                                <a href="https://github.com/${user_name}" class="text-sm font-semibold text-sky-700 transition hover:text-sky-900">Ver perfil</a>
                            </div>

                            <ul class="mt-6 space-y-4">
                            ${repositorios.map(repo => `
                                <li class="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                                    <p class="font-semibold text-slate-900">${repo.name}</p>
                                    <p class="mt-2 text-sm text-slate-500">${repo.description || 'Sem descrição'}</p>
                                    <span class="mt-2 inline-flex items-center gap-1 text-xs text-slate-500">${repo.language || 'Code'}</span>
                                </li>
                            `).join('')}
                            </ul>
`;
