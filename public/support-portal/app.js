const LOGO="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcwAAAEgCAMAAAAOg7NNAAABgFBMVEX///////7///v+///+//39///9//36//3//v7+/v/+/v7+/f7+/fz9/v/8/v79/f79/f38/f39/P38/Pv4/fzs/Pr39/bt+Pnm+fne9/nx7ubk7Ori4N7l1LrN9frI7PW27veh6/mo2u6X1O3D0drG07GH5PZm4PiA0uxe1fFG2PZDzvAl1PUly/MO0fQM0PQL0PQK0vcK0PUK0PQNzPQI0PQEz/QBzvQAzfECzPEAzPIAzPEAzPADyPEByfAAyvMAx/MAx+0Ax+wAx+vHv771qiGps7uLvTvwnR7tkSDTkFSVlZZevZdSpVwLw+8OseMCxe8BxewCu+kCn9UAxvAAxu0AxuwAxusAxPAAxOwAwfAAs+QAmtTneyPgYCahZ1dhX2BQT1BERUU/QEE9Pz48QUA8Pz88Pz48Pz07Pz48Pj48Pj07Pj47Pj07Pjw6Pj09PDw7PT07PTw7Ozw6PTw6Ozs5PDs5Ozo4OTk3OTk1Nzc0NTQxMzMvLy8qKisVFSSy38PgAABWgklEQVR42u29jUMaSfL4PTC8KBFiwvAq8qLu8CbqPfFlNTGi6/rdDXe+JMEoyd6DL6cJSBIUecf7139V3T3DAANiNtnEPepuEyMzw0x/uqqrqqt7OG4gAxnIQAYykIEMZCADGchABjKQgQzkf0h4JoOWuP8Ym/8cNg8PkN5TkuZh/Esz4nCiOB7RX5vNA573jiQiMzucvsnJcAwlGg5N+l0OqqEDnvcIJeqkzSeGozsgb1++RdnZebWzA0j9TuQ5PGilezJSAkl/KLrzVimvJHkbJTwHOO+JVrpEQvLly5cdMPHvd69iIRfgHBjbH32sBJShGHJ82cJSoZoo73ZCXsA5aLAfWPQc5xRllAznDpNWmu92Jp3gCrV2Bb1eP1DXH0TMnGUCUKYOJZSpaFic8Pt9KP6JEDhEb5U4J5BfM/QccPyhHB9vuIlyOxYNil67ViF2B/pFTZyvQr4h2WfiuQcuf8BvGzTknXIy3ya5Bpf0xwDlIYU5H3TZtTqNXm8xM3loIEB9oR3AyCTqd7lsj4YePOD1nNErRiIRr3FA6fa21rfmXnj4hb4LU75V+rs+x02+TO3uEpbb0UmvoNVo2kdA3qzTabXOiShzbbcjkenpiOj3g3NrDQRFh1/0PlK/ibvfUc9n6v8iX+G7v7KPyRwNvSA4iAiPhqRI4uvcHs8ZQy8PdpMHADMVDTi18GV8l3vRah2TO6icb2OiKAaDQfjP7w+IAZc9EHQN8X238Z+95b/ytK+mkviXzeWbmAxBy4XDYWw/MRDwe52CNGIp5ZFTIS6ng+/nCQXCMnl4mNoOutC88tJ1Ozo06KfWFUbVjIX8LrvTFwii+AWrLygKrLVMDpfLqS42waJnF+obqEaw2VofS9Dr+zrT7my5DynH/L0CP87hnQjH5rfRvUylDkDi8V2Q7flYWPR7be0uqTcai8oyPR0Sbu2NhOXr18nkXioVCwg6i0RSr95iPAyfE+gJ7WyjFgs2p8vlEuzA0kn1GS4YjinuQr6bGNxQJBwKidgV8dC+Ug885wq3XWg67Df21UsnlPcxHQu7vpduIkq9V4zGXh7G11QkHt/eBqBe5f2ZOd92/OD169e7qyjxeNh22+3zPNjYOOplajvs1RoowMcO4QEYc6uA0yZ2q9ByEVBOHxk538aCAacREOot/qDo4iysDW1RuInd1/J90Js5OFiDrriNgrn7gFfoK/Wg102m4FzowNKFQKL9YOE5cZe0Br2NeDzi/U4woVEFf3j78DVwW15ZXn76DP6H8uzZs+Xny8vLFOi8qG+D+RrAUNnbXb0VJnQZ8WWc6OV20KZFMqBZEGcE/D6vPwR2PRqe8DpN7crpiJKB8+026KNFrx8Rg07GEs53RlfpTaAN2U3SP/aIwI9oX8DKpGJhiGVut7W8NZzalYRcdG/3IB7QWfrQB3H7YFdqjr297wUT2liPKONLS8srCBAZPqMoqTx9uvJ0ZWVtRrS0wPRvv05urOPN7+/vJ2/XTDM3sR1/vb4OLEWbwSgYDXqdA8IMMRCMbdN0+0400BFyAM3wO4w238YCD8Eea8SgoNErYO7Rm2CyT+TwcJ/86zCJTOOp1HbEb+T0tyUzXLGDvdZLJfHB+hg19QATzqD/399LRb8LTPhKb3jncG0NQP4MCH9GeaYia6CZ+jaY6+sbG/jIGxu3w+Q5X+y1xNIoOF0O68MHrnBE9HoDESk9G262AS/FSI+AJsLcDvsEA6/XBOBvXgFzY2OD3Ya6oIa9PkCH6xaaYDn2dtfbzz6IeTlzPzAP1+VzvxNMPWcJxChKylGd5LOf1WAmmzAP45HeMHkehrfV9fX1w1QQIh+f3+8FD9glBnx2q90ZprOZO36OuRvEI+PMaIk5YQzHzZjoMNh8Tl4TiAS9DEsXmG9acMDH0IV2U6mo32ju7Z5FU3twqZZr7R2k+rGzCFM6cWPj+8DUc0LwZXxpTV0jn94GE1pRuv1bYXKh3dXnz9eTqbDN4IRwEYIeUfT7wtNBr1UIIUqIQCQDCldy+HwC3uDjiWhsB2NNhyAE4E+tTww4u8F8006S3BzSTCZXUzF/L91EL+CgU8d3U/3YWRgzD/eYkf9OMPWcM3y4tsy0klL7mY6YT9lf7Mefn63Mi5YOmBvrfcKESCa29hzkIObT+iAAiEQiwWDANxacDrpGHOGXsWgIdJRFqzznmIzu7EQnBJ1jcockgYClLRADpnZHQOzQTNap9pMt5rVJcwNp7qaizh7TLTwferkLhyZbYe6lYj7+NjurMSBM6dTvAlPPuaIHzMI2dXBlBTxaJivL6P2Qz5fmRWOHmQXfg3kct8DkTaGD5WfP13dXRasrSrxMcDGd4MuCro34otsTdq0GNNb3kHidYHffvn31bifsC4FrBK5sxGV3iTvv3r2Nee3+SKADpgQQrSTRxHXqFRG87HeHuymxu8XUE/en1cgmqWoGBX1fMPfXvx9M8N6ir5cIK8muggu0vIwK9Pz1a/wTgxWIVUBtn66paGbfMIlirjx7njwIO4QgOPGHuxG/024PTIe94NZavX5hxMBzQwLJNXG+6NvYxCQGmDtRURTDUdHr8Id3Xr0DN0h0eyP+Dpj0NpKHKAfQV/Cv3b3kelIeCDaIkrm6BihmjZjaTW50mNlDdIE0+v5gJr8XTJ6yVCglhiDLy/HV+Zgk29sH8bWVpaWln1fW1DWT2dlbzCyvCR0sAUxoF6t/+2Dv8BDcEa3VNx2PBb3QRzScPJoZHc4RVygWcntIKg9o+r1eUMvY23cob6M+Z7ATJm3Gw91pKQkD955K7cLv12VzC57pdkBv7tYaGGTKQ+Z6k2lyt49Q0/J9YWL25ABZyjDBvD5ffb06HxHpPLEPXE7QivnVg3h8bXnpT8DECG5tGWDGg4IreribfAM0YwFv8GD75bboHNIrmljwg8Udm/CPTYXpnEkq7LJb/SnKEmiKrk5vdp0g2ztcFaVUrcvlE2OpAwkzw9LdYuItppKyQ7q+impNgs0N9Nks/I+smbzOEgaWT5swoa2fx2PhgNdmNBgM8kyx0wtEY4BzphfM3mYWs11r0FcOYn6tCObvEGGmtkHxIyFR9CpnQDQj/pDNGUKzwOan38YjXq3/5SsG81VUjHg1XWBuB6yCQacbgf/BvbtCGMmvy7oJXS7q7HKXmJ6SFHNjLzkf3SY6ncQYOhXz3pJul2EmvwtMPReA9m3GIz8/fbYKShlwaHWY96ZisBhGkKjgEqfnY6KR7waz95hJUqgAExTT5owe7NKh7fDly1Qs6HP6W55br/OGQ8q6kbc7qcXImP/ljkRzJxKU0qUqMI1GPZl+gXt/pLWGtnf3FTDX47EujQz+Mw0yKYyDmDj/mvhQGKaC42S4xc5Sb5aZgb8aJjV8Cr0ElvFYwKbTWQzKu9BodAazGaeKAxFROS9yF5gYwUHHWV5bDQh0xKQsX4IdcAlCS27doHGGW2q6YsHYy5eTE6loVFJNGHfbM0AE2MYGwFS0umbEagumwFzuNzVzvks6Bx7n5WvZ/UmuhgPzBxLMjVtimr8ApmZoSKPp5ZEcLqFessTA0+XnaM10BvVb0IGCOl0G7svMrJmbxAhoeW3aKwQPm4oZCzgFY6v90ljHJqLKCj3wZmOvXoVDqbBnaodqZnMEU8BcZzCNShUa0cJN7kkw4biuMHlD+CX4svg0b968OYgFfDGSeCZ+MDhOfov51gzQN9VMnhLtqivLSiO7Fg+7uqGkU44dXbnVAYp2hYmzjnEMWONBB8RyDObLVNRnaJ/K4LmxcGyHrlKgM19iAEKSV7Ho2/CYPUxVMyyowVwHK4owlfep03ljqT0WL7755ZdkNzML7RE7ZFYWYYZdGHSyLrKR3Ls11ESY+/vfCqbWPe62P8D5ezWe0BHjECr8zOZGnj4FvXTqDLdMR3JfppnY5PFlsLLzAbt//gCniJBlxKXr8BF5iEdJxp1pZyzgD76lJe47E9oQGzRlJ6YNJmqmxdLi5YHvLMN8A4Fml7skQeY6yU4CyzeroiCED3YlmAAn5u2dpUczu/+NNFPDuV/8CjI+7h6Bfw4NtXs/GMOTaRKqmeDGejWGuw26LWNmr9BED92ewJz22sXV18ldopdg1Dvn8HleCL/dmfRPTISimK2d9Ie3JYMbtk9SH+iVT2Puqpl6JUy9BuKNvXWqb7+82T9MiQLfxUMjGQPCcu9wPqDVBrYPpKEYHKLbQk2imevfxpslMH8D+fXXF4SnZqgjVECWzPtZjs/7dXdi2ekAdZ8CM3OB7dWnOGS67GL89e7BPMT0036LSj0Gz9nD0ckxO8hYOBqdnAhuS7XQ76JuD/OBfLo+YZo1/t2DPaqWv2CCaN6vmsvBhzlMJple7h1Me3UGVxTtLB01QaVhoL51zPyWMFEQ6G/AE3FqWkKFZQXMtXjQYOH/HMzummnWhuLL2GOmnVY/RKzzAYfdG3AYOx1E3mwPRSftkyGf1QoBkdMXTEkoAeaYmw2aE9r+YPJmQzjFWL4BlnupaZuqtSTuzz41svtv9uJBgTNY4VSaciCque3vOav5LR0gqpkU5W+//f77r4iTH2oJFeQZkafQzLdmH3vD7JkB4nVBAnMtYtM6xfm1oNNutbsEXWeaVMdNvnq1E9vZifm1WqvWEdzGATM8GYriMoWxMTZoTqpr5j7A9HMWZQ0FBkKoWW9+2cBylZmAXt8t+0OOY9Mkfh1v1gYwG7i+QewsZtt7TYZqDH8ZTKD5++8vxrUweLKhRDxYW5brfMCTFQ0GjvtWmgn9fpXADAs6qze2GHRpjUYILzsbZ2hi5xUuBIPRMiDoHSJh+SoamgScO1Gfg8EMSd2yBeYGgclmqzBtgMln8J33geUbCDOwxMGoWgg/zE1CXCLNiKKXhDC9sQMKc5+6QK5eoablr4X5++/jbnRtWaiA5T4M5rO1mE/z52D21kyjDJMzCMGliOgVgKZD6Ih9bTG6pu/t21TU7xRTUh4Ih1HfhMsuwTQO8Wow95Lbfr1RLr/lfdEUKCZ4Pr/AYLZ3uBu0GfRd3J/DPQoT7PFuSgQl5HVCKJVkqd0NzNH3rFNg6byvC1Oj02maMH9tgQna6VaECj9LLJcBhNLk9VXx3+HNRvuDqfWKYiTitRgtxrZ8AafXuXbYAs2XYb+P2li6ECxktz56ZJFik7CgCnMDYdKkgV6wufzh2OEBK8va2NtLzXdhyVFrLMHEMAS9ZZ0WCw/WyYzoBik46BFqar4JTBSTTtMF5h/EtYUhc36tCROtrFHP/VkzG+4LJq/RwrgZwapJju1q0AbzLY6aYZ9P3JbzszvRCR4LphUw1cwsRPe74RCRMLjC24cHr+n8NAS2u/GYaOPUzQ8/FIa4hM4sI8ywDQ0qr3OinU1uSP5sz1CTjZlf05vVaNwet5b+oPBmmzD/+OP3cXDYA/HVpxJMDOb9BoUFeTTm7SYuh/4LzKwOx8ynCBMNAG/QCr6gT+N0eZ0WTrlKCZuPZgwCXl/wpayX0UkXKgXPjYQlMzusDnP9INVcwIuAaKnB4WFqNeIXDLpu87qY7aEVMBCXpESiwLzOQPzZfRqdJA9Sge7Z9m/hAGlGfvq///u/n8bdUmjyWwfMP8atek0IrawMMx7zGnhluibWVcJyrv0OGSCNjsFk1lyntXpdXvyWsL91hY0Vi0S2w34wkRLLVzvhiTEDURVOYHFmSKcCE8JEUuizu/uaVjGvS3Ufr7Go3anVdU1QTWwfJFntD8CcZxpo0vhRNaVCBfCLnPrbJqe/JkydFWEiT3c3zfzjhVVvCLfCjDqVMMFNj6sIqWpvDox3yc1qg6vLPz9dXpMmE3nd0Ig/hUqEW1DwCjs7Fn25HfS5ApG3im0NJlzk9nCWioUmKnFmEicu1zfayvLIv1cjgFJr6Z45jh6wuAQzBuDLsoUsOhuoJjOcCBO8K/NfCFNjZzCB5q9dYIJmCuG1FpgRxUQ6r3FFU2ukmosWACmKu1aXIl1g9hwz9Tq0BE/RAkijjpHzkgVKL9/CU0uLtXhO4wzPB5wuMfZSuQ6eLcLhOd9O96QBwNygIsWL8nzW66jowxmf4a7zcwcQv5AJk1/2DrblxJ1BK6Z2DxkfGmpaesHcT35dzWzCHO8Kc8Rii7TDNLZUBh0sKxYnkDw8jUnX1qLdYfbIzWpFqpnzfinaNwmiNLRFnXSCB0tlsZLW5Q8GJpuzYODK+qkTPcyF2Py0X6cGk1XhySIp6PrrbWLRBdVFkxCPhjAtyx5E6eeYtejlrieTfYSa3yDOVMLsZmbHdYaeMDUUZkdBNMjKWuTLzGzol+cEpjTbiD1GdlXCARcWrj9weMUgqJBfDLqsvibMHb/kg2qY/6OaaJcLkCWQch3X+vrBAa42Cfv1KnfIKiylUqGmlWV2NrmumNVsnZP5xnFmXzB5FZiWDpgdJJ9iqrwHzK6aqSdFDT+D1xwP2swsBeWLKfzOmOiygFpGgl7BJQYDgglilObuFBqLtBaTDZk7Nq7TAUpKla4bOHompWosYJkkbtFqKjUvqtyihVRYrksT2LspsZkQ1BnI1Imk9EkWtHz7MZOE9K0wf1OHqdfZIrID9LQrzKfNhWAsi9sLZvcxk+eF0PzSMhZXy4Mm3GhQARNsrSiKAb/LBXbWK3A6nSCVjryLunhq9cy8j1nZsOyHdMA8PAQXRpJDVga9TmU3lQp2lM2SBSa7LC6hVpaXfVYdpvSaLlAyNe/V6b+9ZrICkb40c9hAYT5VwDS2zOcerIA8bZdnz1bWmqmivsdM8FsikdgKfOHKWjygpd3GBM2khDkfAQvr9PqDohPPGOYmmGq+C0vBnZmbZEVAE5waTNKMe3vbTHZ3D5JkweQ+C0OB5kEq3D7qYYnBQVKCebgHTo5eMT7YolhDxBZHYWFXFxfoq8aZgn+CbD0g9AHTygthhWY+g9DE1ZxaRJjx5RVJlp82V5w8Xe4Fs4tmQnvDUBicX1nC6jx5DY5OO7GjgBkLuARbICh6DRwNKaVB811Ia9FwLYHJjkv2S9thvjlorkWPbeM6270kVUwaih6kgm2VWTwXOtyV18zsHaYCw8ZhUpmImXqDTkQXaF2OTqLdXKCvp5m4V8D2PHhsrj4084WdN2JJjqSZz34G66eE6Y1Ja+Gfr608f/a0H5jdkwY8B+rm94eBJqYnfFIGT2ecYLqZmo+IPofTD56sk9Ow8VGGOam1Wx+R75tgihlueiHt3uzhgeiSxRcIRbdTu2QIZQtQgKYoWNrdn10pmNnfW406Wx4C4zRZ34gL1GVW8+vNZ/KcLQhR/UHM3xdMPc4vKswsepnm5pjpjW7PE9nGv1f70szuDhDPBYJ+kOm15ZWna81QTWMQAiTU3I4EvDabF1h6TdIVdBoJ5o7PJfoeYRZXcn/AyqrCJIq1G9AadBoUUsHtmIimSBm0tJwomYq1RP7QReAAeTFCcj7ip4lLn89H/vZHU+tyFqhHtv3rwlxdW45P+x19wHTrdWLTzOKSoLionFt04C4DkojzgFvpzd55zNQEgs6A6IRhGmAeYG04m34Z8cZSqVgQK2ddgWBQueuAgZtgLEP2wDyu+WoqZtTB8d1gJrcDBqM0wWPGrYScYeKrrrN1mm1LunAy8HB3f19eRHaw25a/nN/FvtBcREtnVL6pmdUAzBWE2Y9munmdf3tNARM9IL3SmZJ3sTOAn0Jq+G6F2T3OHBJFe0D0BWfWwKnCUZP+VgBdjEVFv00QvLjy1mtRVlhrqAP0Liw4xGkfpx/mnCz7825SYehaYbYXQcPnFq0jnNqVZiVZnV3To8Xsz25zLQpOW8Zxy5zXr1dX42SvkTjObSflxURdXSD994H5+zgHPo4CJsm0K6tGeF7PXADLsC+2Jlvk3jC7aaYOYCKuyBLmBFfjog338wGUQVRKLdFK0fWgJT0zrBsjG8bs+DWuiQCootkYkurZXeowpVLLtilL6I7EUMoZVkzXNccUHWZ/lDCTcmCzR7YN2VMs4QVbnExNqy8KlGDufx2YT5df92VmAeaILRxfkRBRO6ve39Bxl2E+65006KKZYAZEr90OHhB089ev4/H5IO6dhnk7I8STLjEyLTr59mJonZUEmmHBwD0YgZBcNrLvJpVmTq1utm1MG7GKKTlywWAxHpSrLekCE0wzSHZ0v7d0r7n8yprZL8w/XphMWjG+stKEifMm+m6F3qtysujLYGocYtBrReUMRnD1e1AMkM0p7HYnLi+bn6ahZdsQpA29ffUKWsRAv2tMMrLR1pqITpjt0+wGeFZlti+ZanmGlzhholgv30aPVPUpYCa7ZdstX62inThAzzpg/tYFph20ZX5NSgsgzDVwuS1/BmavpIHWC/GjDUbgEYcLJ7idjsdDOsEJoUP4H/GDeVFQmcA3awM7O1EfvaIZkEmK6W+5z9uWJ+DJusCBAib4s/KqPp4zwoB6uz627XCgGmp+jYp26hgSmE/7hYmDpjOGziUTtLPqKxDbYHbNAPXcoILXuUQINR3CCC4PhKiBM9r8QbLL4nQ8Fbaplqxo7D6fU0dKAyxyuuDdu1BrSZ8KzPZUuEUjHtAaOwpztwnTzHnJrHQ/EJPKnWTMXctGvkYGSHMXmH+Ma4aMIVBNya8hibaol7f0o5n8nRPtOPvgx9wrCIRvE2IwHAkGwNK6nOF4RLWwnZQnMONr4VwyS+BguAWmvu0p9BocMzdkQ4o7wcgwQxhkbii3f6J/sh26mjt+yT+QUNPQxxTY3TdC1DhcLodDEO4GE+2slzg2cgQJNCPezq1f+4HJpo567dCl1+jIzj/BSCQSjcXjB1hmrON0WnE+2HVNsp6UB/G4e+Y7lmHf8bcNBrfD5PVCOLXRhLmPC7p4ucIytZeUcux00zsVWd+TNl/DBQy4jFqlyK/DAbo7zEe+ycnJiQmf/U4w/wB/lqVnJZg/ryyBbnKcmVeF2Ss0YdMVqV7brfEGjUkQMGZcA5d2d/cgFfVp9JYRpzgdGOpVGGjWcH6ygTALMS3cbTDb7IuFlFFKI/sbHPREZiZphaXs9CSThy/VhWzERyuKsACwLSPYhCk7QPtfDhPELgTn7wJzRKf1x8AF+pnuwsUsbQx3IWzZ8tnCe2PLfcPsVWpLhnatIM7jFqXJA9xv1siNaB2i/0H3hzaZOYFuBo0wX4UEA98LJl2eYG7RS7DRh0k27/EGnNNkatsvFZ2MtLg/bw7no2F1mT+UHlNa3serOkAtMHn9HfcaFxhMB7TSs/5homoaxTiOmoQmHTeX4tuktgK3IAShLw/xxZaftcSZ3WDGw8KtXdEANLfZRtCp7aCX02qtQtcaKdzv1xeWF4G9Cxl5A9cDJphAXJ5gkVqN7EjsjaZe769LK6JJiTPbD5EuMJGtLFbfeZ02IvJe0kTsLkw7JKUEbVI11FTCRFsecd7Z/+kN89euMF9ocN41TrckZar5dGVpDbPeLsWqAcE5OX8bTDkD5LLZHB3SusG1jtE8RJovYwGbhuuymz95f5+TqSVhOSmY9VxvmHuomcqDHBOx1OukXHlHYAaNPAt4xMPddXlammRtjUaLAcRIhfxosBiFUOr1elJKOyT31DbTUybacWCNetVaA5qje1n8l2omqqYuQGPNZjUBmNq1OHnPiN/n8/ogyo9GY6vPm3vP9pic3j/YjqpL2KcwSjqtMbCd2iXr4FNYYOBCFWzfzX/YjDsIuwDlO0kxX03oVMLR1j0NSKIdXxNA283rD0VfAksZJpl8ljZDBPcndrArj5hvMM+HWk1qy1rMIq3rkmHSaoRhdZjJ21ojKgrdLO0Xw3xh12utYGiXZVAk3lxBnOBt4mbY4HXGn6+tPX/ahKmmmUl5wiGlKvH5lilAnVYbiEk0CU4v3c1feq2JmbrUTn9oR/lOMJ9GLVRXwqS7NsnDHs5OHx7gIjBpWHyzf4iVBMx7gfvfPZD3I/3lDRnm+C6RFXq9UtoBSMVFg7nL8gSpNVTbAve9j3TbiOjLYYIPNKK1BdtporFdWVoiROPxtaWlZVoN9EwNpq8VZnJXVeLzrT6JRqv1xeDB6N4xqbdvtyOiz9YyGA45fKFY8w01uEDB1WWPEApTYrnf6pCmDppJdDSxuNpWnlLQ86Fm7c8b9IyC3Rbc6LQhMsctJw5gRGwvj6cwN/ZvaY3deL8wD2L9jpmkSM9KaNKsnrQPIhseScUI2apdsefszz1gyrtpt8veahtMDofr8Haq+Sawl293YqBQ4gRu8DZBXgWmIEkmNW1d5vdbtyjd2CB7tR/sHtBN1veSihwrWW17uCotkcLCfWl7kf03v4CFjgc0XeoodTqsE2puwbd30CwAbjWzG23bo7a3BroWTv6LYPbSzH//4eGZbiqWUNMdhJ8+fdpWasnkuQpMZRq6Mwv2phMmpzGAckZftr6jr/mavra3Lr56FfPrNF13L1RuHow2U07fHLbsCv1mn7wV4HVYYCpl1gR25T0s32zAkNl9kRfa2fiePLWyf7ibCrU74RayE/RGy9qIjsYAl3mtdfXk14EJ4kbdFOMtOBVq+KyjCpos5ORaYfZMbL4BXemESQZO+0SsHWbn6zPpOluXTtd9H7eWnaA3OkRqRFxsu5eKB6V1GDx5UQJN5eHeFW9ws/Huu5dqxZRsZtULu8ge7fu3pHlxV6nupbd/Bua/X3iApgDuCKW50gqzdY9vCnttLSwoNfP1+vp675vf2Hs+r7azg1mrdYlRtZehtuDciYa82h6rIglMDC+ay0vUVigQTT08iIk2aQ4e979lC3GRNWYMemz5bdb65g+SigVhB9vty/sMLRvud2uP/S+H+WtvzQSa+hErDmConFKlbKdGPqNj6PLy6vx0QM6KSzCTnZMLiql73K1OdZsOHdbnBKLb7a8pVtLcCU84ur0rrAUmSRgo135tSDt5N9+7srsd9evk7XF0nIhFtVJeh8xs9chG0nUKUok8mdUUWndHMIQApmJc7SK73wzmv/8Y1+lBOf1RXLDXWvjc1EdaPru6+jw+LXqbDp9ZAzCT68oW6xCEuTrfZc8VnUWrhfvv8gLxnZ3wJHlP0HDviVwGc3092daSTY57u3uHqflIwKWz6OR1aa5YnBZh7pNyrt14sNficZ2W7CxGnxW/rWPT0pHQ9sG6NNPSpTUO8Xsi3wrmv/897uaMVqIiu3GKs7OWffnpc9wbOhr023TKmis/LRhPos9GtsNLdviyWIk633UDHd5MXpQZCEdjO8qXFO+AdZ0giSjzbS+k4pwxiC/wLjq/eh/LeA4PQSe3cfdMgyJS1esC8Tj1k/C+99/E5wNcT5hkz78kff0NxDGvAX7L5p+gmSSxJd9HZ2OAvNmNf6kD1Ll0ugPmv1+MW3lQEZs/GJ1ffb26vLy4uKhclLmIr7Yib3ZzarVmRe8lcw6HaL56y2qv90/wZPdTrdUFIckk2YxgcnLC7xuzk28w3/6+J/L6KLWb2MX9+VL0zblh0SdolOaabLcSh7hply5k2N1ejfSc5eB1jmhq91D+ntXVtenWE3SgmYe3NgacGRa4bwYTcLo5HrTT6PRNgorMk9eS4V778VWsgcb3ooUCXpug0xr0Rvf4iJxy41zhviTYezKIN1tGh5Co1moUBCPbd8BsMff3Wj272OObQ+yFkTqNpvUNr5wj1HZsoPe7+DRaf7DnY+n8ob4aIxww9pebbYX5a58wQTk9I5xeD81pc/lwCjkcQaGN4fe5bEatTsPxeot7/MULOydvwmfFvPGtYrPd/kJhnh824+tWMTMKP5qH+59x0AmO7t8sYB/RkNePt51mtbfevM1yy/SjTmt1KN+s6XC0ZRgeCf00B9yT/pvCJDzdOqBFtvDWWgUBZ34E0BNa6W/W63mze3z8BRypgKnot3QVGvyBP2k49gf3V4qmVYj+0YQv35+O33qAhj3r7fehbBB6N+yW7jAF1h3m76qBplJeAE8rmQTkLQaDFid/LBaLnkxQ6e2ok/Q4JUy+P/m2EHt8L3+H0+7+Rf3fSJ9fdPuY+WufMAnQzXGDFQRUUqBit7tBI8dfNI9V1cyBfA3pARPNooTz999vMbMyTiuya8qLFy9+bz1yAPMvgtkyBWZ/ZAW1chPNAii/drBUhWl3K0dZlSMHMP86mG4ZJg0JdejC6LR21NMXd4HZwn4A8ztrpvDINDQy8sCEe5JqtDqOJ0B7D5ptMAea+d1gtpZaggeE8tNP4x6P2yolEJHnrTB/7QET4kzNoNn/cpgt8tNPHo+dpKx17ibObjB/7QbzxbhHN2j0vwymWx0mJeqx0wyYhFMdJgtnOmG+GLdyA738QWASnsTiagnOf99JM1+Mj3a+H2Ug3wRmoA+Y//oXCUDJ6Ik4e2lmG8wXmGEfGaD8S2Ba+4D5LypEPXWcdfxF3zBfjPNtb7kZyPeF+a+mJDxYOOF+8cctMNlK63H7AOUPZmb/pZQEGttO5VSDiW9cGBk09V8H02W/I8x//esndG09L241s+OPuRHZhR02mUYVYjLdeofN403dDhihnz8wdcrtV+0h5jufYbrt+N531XaPprscrYTZopk/oYyPj3s8Hkwb/PSTKs3/+wliRveL3qHJi/GmhVW9sTvc7BeI6dte/pvdVssB/T5Eq2YeAExg6HbbraykkOeGhg1Wu9tDgbbhBFtrto6rhyYUJphYKRoxQWTCPXZ7Nre2ElQ2p0itTs9bHfVIMuUZVT3C7ekiY2PurpeHq+Eluwr9QrvijLEpdoKn+xke+QwNOV71kLEx+0jvp6bwhu32sTF8hpF+eSphPlt+HfNbjUaytRY/ZLIYLRaz2UD/qdcLds9PHTg9nJUf76qZyHKkqYD2qa1E+uj4c7laQymfHKXTiSl4/gfd7tTETR3Jkh7jOo8b5bbIZ6qSSGxN4dj+sO0kHZc4hnOOugucDH945C80SV/T6xTFGXBbnd+guC0M17uMG6TTu6dIj8djodOTPjJq6humAzUzHvPhC2oeOVw+38SkCEJ3PPC5HGTU09rHfkq08vyJezwyrpab/Y2+bIqxhOZ0b6aPrqq1aimfz2QyF/BftgRUj9Nbnq791MQlGtVy+erquliq1LdUSi6h1U6vK6VrkFLp+jNcNXN6coJ/ZfJX1+Xy56PE1Ej75XkufXMFZ+B/anKVLxSKlasjJczESblSuup2xnUhny8Uqyce7gE5/jGXuMELtR1fKpXKZejL5aPEpp3jTKqPzFmnEunj6yo8+HUeH+LqON318G4wny2vTftd3gny6qRYLIaFfTF8e2EsGg2HJv10RbQB9LOFpvXh8Lg6TJmliefsW+mrBoApFC4v8ygFaC94umqtUT/CSEftTkc4z3G9WqmUKyDVm7R72KQCM1OuVmSptkqtftM4Tky1XZ7XpG8qt0mt0grztFq97ZTq8ZQCZo/jao1GOb1lV3loE2fdTB83bho16evgIRo3NydpwGnuH+bz5bVYOBo7PHx5eKi2JicWnvDZME8ueBItXu1j+wu1MfOFW0NZPuCGNtN1IIkqeXqazWaRZi6Tz5xfwI/lRuMIHsxsUlXMUuEqC0qcvSrXQTVHO3lvneQL+WwWDslmc7l8/iKfyVLNvwDJ569rN8cwuLeYWl36pnidx8vC//O53CXcxkWOdDL4E3+bu6y0wTwpEZuCn+VzHy8v8cB8jp6Ep5xnL0sA09TUTLitDPkO6bAcCNwZ3FXhGjoxGGW+LVX9gPOkazf1SoldFQ7P5eDOSrWbGhw+3C/MmafLK6vzBwfxXbIsWQUnWYfjxx1CtZ6fFG6Q9aHs0wLMFyw0+VXSy1HOnbhuVItAhTQe/D93eVm4zGUzOWiZi0+FMjzYlJrF8RzV8vlLhJm5vK7cpDv7MsI8y+eyRLCN4cJ51P4ckM2xlqg3FMOfBLOQpy39EU8iLQ1/wD9Iq3+8LFbKbTALYPRIl8niGZcMjgQpl2uD2QDLm82QTobHwj0VCnhXF/jQuVyhCJ1sq20AGOU2j26q2Augj11Sge6F+KFPHm0yve8DJi4uWHv+Opk8JC9bV10w9xZ5+rDi093EmbAbPX+0w/xtnNOyG5xKN8gNZs7Pzy9yH8G+FoulYuHjZS53jpLLFypEe/gOxTy5zmfPQZtBny+vUTXVYJ4WMlQFACReugR/FODyeXr93GWx3ICGaJ6qAZiFAo6r53DSJd6PLOzsYrnaDrNYRE07R5gtZ1ApFEvlSgvMT4XsaeY8k/l4yZ4Y5OpSeujsZbHUKG/pTEPKh5k6bhSvL9EAfKTjUJH0S2g3PPxks8OX6wVz+fnzPSXKtx1CFldhtT43Jhvbnx5bxpswf2MsR9gNbsINghpk8RHASyheVYgzW706Bft4QZ7solhpNBLW1vkxVMwq2uJTItmimmqOomZeZLJn5xloHnAuiMAwW7o6zRQ+UZq5YrF+pNRNAvP8DNoaSMNZ5TIZbWu1elMajeM2M1vMIX/Q/wK6MeXmadIZN+Up9tRoZgtw+BlQwNuiY3m5XLw8zRUKWXzqTLZYqlcTirsyDY2lsamgpTL5IrgTcA+NejlfzJ2fnmfgIRrHm728IEVoMrOyvAaK+foAX5aEm3yEm1s1RNERYiusqLnF/X6GZFfoJ44Nmy/sdgrzxQgt2gXDcVLH8ekMngt673UZBvfr4+OT03K9Ua+A+fkEjZorVquNdlLQgPXKxUWG4IbHAXNZ7uiaBGYOFSCThcsen5wco5x8LFXr9VrhsgBnnmZA++DysvvEDxGY0GaZy+IJnHPCTmuJJI7bx8wi6OVpppgnX9M8SXmWcswEmGdnmexV5fSYHXrysQKAauWrQu4D9CSkeaXAw8NJ0FTZs9Pzy+tqo/EZb+JzowEjKDZfFmim3T1oSjDHHIF/rKytzc/Horifq8/ndblcrCIeQ1efzz8JUNn+HcTaTsDgaZdsrUdPE3svBPs4woQBc4gO6FNH9RLcIPTR80K5UgPnEvxsFIw5YVgvFfMXHwrgqx5vWduM7Fi6Cr0A2vx99v356Vm2WL5JW4c7zex54f05mL9iLbGV2NrCS9O8RPq0USsWPhCa15V6Uwl4qpnnGB2dJCTZIucqxd4GE72cbKV5RudZ9haYqGJXpWPpKHJX6fTpTaNcKuBd5cEgNXvMKPru1/kc9IDLUq2e3pryjHk8U1tpeIpPaJ5gHG8kehhahZn9x+J0RPR7nQ5BMBoNFoPFiCXpuEeRRqOjC3McYxMh+Y1p1NhKjq398TjTzHFcbz3O6WgbuInh+PDhLPOpVK7eNCCqlD3SB2Ob6c+NKgRflcoNjAeaNsduqwZ28gOYyexplhAp1z9PtT0MdYCyGfCRS/XN1oezTyVOkObpGYy4pcaRnHTQEQcIWV5WwZb2k3+jZhZd8drp1O3HM5jYW9ApbrkrT+IYlA1uCxSwVLlJaB4oLNE1DAzAslpOyOknd6IMNKEd3hfgIXqoZtPMugIBr8tu1Y7oDJ2LOcmaCx3Z7lVwTYSlt0yEXVpJObesxKNNTE2BA4SKiTB50yM0HLmL87OLfLlcv0kT7TOPmqWs9MhUotyAAQXH9jbFHLKnG4WLiw8Q/BcLpTzYWeiZN4mhYRXNJDArjU2T1WSG3mcymR6MkMFrKl0v5s/RbhWrzaQDLzlABKbpMRyv0+kMDx4oc/VmZazENPP0NH9Zr2yaRqWDdIZR80P5tOYZkmZCJ6qk6TcYDDopbe4Bj7B0cY5+QElWTRNnT9dKhfdn57lCFTSQG32Ixz+Evp+oAfzc++xludbY5EZvh2kX7LhtpMPhdLUI/MYukL5DXw4BOmrFXXbY5g827chPzAkC1fz/tyYnt8DIjvM65vyUq+DknJ2fFYBlGefNFDMlJtOoBmPkBmE52q4LW58rhcwFYCifJMATQprXSqekCTOPQ2a+0v6gptHH4B7WChdn0GzXJbDR7FydBPPysgYXfNivZgLMy8t6dfO26F2hmZflSltYZBodBWyNSgFoZnBs3KI3AMPKETQW9Dz4jhPoALJbYILDS+XiVaEEo1FCc7tmIkS6jc5kq0yA+HBPWupC44o54OmciFKcoJw6N/GDPO7N9BYcHkr89qudvFEelat+XcBBAFg2Pm+qJBih9cfStaNOljz00wtwdnOlUj1tTTdQvdGhTWiGVcfMzGVVpdc+BltdwmEzAy7Q8Vg7zCyB+aBvmIgfYZr6gplXhUkjbxh90NjQJ5LTXZV89vT87PKy1Zo+4rZuwJsDAYf5yN712yWYiKwdYztTQPqI8jQbdPguHqqcPp3WnSBTKFP/nHA6HL6trfHHbMTcqhavQTHOL0qEpWqu+DFn3/R0zF7DueUqsPxQKNdqmzCagMtwjlYJGn9UDWZWFabJ5AZDiz4QUphinzMze4owjzycqV+YGQlmv5p5rg4TRpTNWjl/TqJnyYuHePykksmcniHMtF2RTRgd8qSPmNd8nPbcCrMPwQXmmHIn2ysPmzU6ivPdzoSgsyNNMLEOTs8JU6GJEZ4NAo1CHkb0iwKEllttg6IytczpOn6HpoUoJokuPUd1sECnZNRsMYu3wEQKtUqONFvzc4RZJAmgy/rRWP8ws4j/bjCvVGGawHLWc+DYwSBSY90TYB5X4FfkO+B3j5XwFdNp9q5fauwfJuUJQB2YcB82mzmdI4QvmNiZFHRWGDj/GXLpeE6vcYRC5AVNMGKe1AoYtueRiKnrHI7KJxCe5itXeQhnYJjYIm1TLMKVLtv9ORJnAszTrjDhJvIfwKBd4oVGm2b2S2DezcwSmJWKui4lajkIj0+zV+UMNRiYI6l8yr3H5FAZMyjc6B1n1u8GUzK5PjKBMmxBVwh3AQ05deDU/jNEl/UbJ0K+xyxNDsaMKGbjs+cudUAmzoqDSoaMKUduDZilag38P4CJjp6pLTTpqZmbxzUYiRC2rNQE5ic6Zvby9VVg5gv1ylTfMAF+paoGE65XzUJ3gtsq5zcZTIirCxBQQphZrJbTm2xSmrq6OvA9iXPbwyg88qn4O+3Srp+hEOrnI3zlB25i9+oduEEa9z//OUmTqxrf5IQdwhLOftS4yGfOzvNFbMfRu5RVEC8UWhvsM55K4JYL+OzFm5YsiGRmT3vBLDCYzG+kYyZY7Uw2W027R0d1ptvKhxjMbAZCk+IUhFUqpyjtiwJmpRvMDLENVxWmmTw8I3gGOXS9c8Vy4yS9RSvOR0ZNd9NM4rP6XE6MQx49fPhgaGhIMzRkevjwMS5/dhI3d4KBlHiCemoMj7RGPwydUdfIWGiCwXROTDo5HsaAz7VPOehoEOt+9pjuAnPInAA3+AJztjdEdcDsVqulHDgUxVpDORM2cruZPa5iljTXbmYL6ExmK2l7/0kDnPEh4xnXvwPUxcyaE5VMIUvydpI//ZDbqldKnz6cklnCq1qjdpTY2hx7rD4QdXGAiFvjEITHQyyalFfzsyX0gPWBVbBj/YFvQgJK1RMaZkTrCu28ik74Jn1syyYHgQn+aK2KQybqRNrOm+6imODw5MHK5olimqjH0CgB3uxVqUU1aQaopwN0XSlmYdwu1uXPqZlFr+i0dISpNhXZbAkBmg5QtnqsfkYioYB2i2aSx8lj2vnyui4ZehOm80rgemO2K3ORyZeA5+ejdGJzjFraW2G6YPyTJmG6bYCgfGua4JB5EpxOHWfQWieiO9HQpIt9HYE5zOkSBOZp9mO9nuAMd7KyiXrlE1XMU+rrkfzDNY6aRDUftpnZ066hCbiNnwpZnIZoXHmUocmnDHEc823pdZZjP2pFIGkm6Mzl1cnxUedJxyd1xW3dEppgGFIrXMDnhXJDzmXAl9xUwdBiou/sHKfwi5UaBJinjGc/to0nFVt9HMcPk/cJWEBFJySDO+lzPtKOWF2T0Z2Qi92zgDBhyExUK9iM2cvGfzbvApPMfWGKPU9Sl6ZmrFJAl6h8o4jCeocmYNs3P1cvcMYJW01SNh2dNTk9PcNJYJIblqVULuMvaidTyovJZhZoFrCSRz6+jMcXi9el2k0nzIy6N4spoNrVJ7QXJWZ66LfYgWaR5GFh5ETXMZe/LJSrjUb1KLFp5YZNtyK6W8knvhabMwuMJ9nezGfXjtgnwiFpY3yimWa44QrARG/+pr/IXFktUsznodtW6jUJkAFGlGrxArPQyuAAYWbUYfI4THuIh3h+liNOGOtRCPNTDjQT+n8mT6aOr6Xp42IBp6ZLOM88opLOO5XPKJXk2ewCSKk5JN+SzoPbsieuihBEn0Hk1VBM66ECNGo4cU8nsGGIymYu8vkCTohdpzc57utXAfPkhSWPJIOLvpADaCodIAeBWSUwP1417gQTffTGpwvwWTA8HTFJv3WjauKcLqYRhkwdY2alvjlqbXVHH2+mQS8vPpx9KJRwxmW0OZ+ZwzETPcessvSDVOmc57KFiqpm4iQ5qRpqOwOMb1ENJppZCE2aiXmTCXN3nsRJsQB3dZbDMjV7s9gAvPbEcaNWLhbx6h8Y0QyxuLWbTHsp01cDihr92MH0c3JizA7erEYOTQQ6CVDJZyFquiNMHbcFvSADillqKibV10oRY0Oimg9bvNn34M1Waq1TYNaxzcRJlQRHwBL8Jp1yPhNzvaTv57KXCsnnLnNZUrOwqQbzHAczUmokn4DnAP2umllKj7VPgYHJyl9cnJ1dFKv1Rtv3AOnPN/XyNViIS6xiYkQzBGd6ivtGFfqEp9VJ95MEYxueZDfkD/lGCcw6wKR54zvAJOn5C4TZWicygi5uEca/j9BuCSuvUcLECqDrckIxTwzeZfqkXv2Uz5+dffhUqtQVqqbTpG8yOeACunEJNrVUhv/hYInDJUq5WmuowczAGdmPl8USrRspySdcl6t1VZjZy+ujLZqHk6fkq/VKIZ9Bc4GKaTW1r9aYShw1sEKveAkG/SMtrEFfrQBx2jejyTYIfOQY802AekZDZPNM/tFkyKXh0WLU2ZipMsPVY0EChDSViwsSUirbhzNpEo3SpwssBsILmpST0+RhS8THJEXj6F1W61XMO5ydnedwXlyRtjBx6cYZ+JJnGBpgGWunNFq+ugmTFC2UVc6oN1TNLDi/p816+6Ojk0qjVsG8MBkwKzfHnd4R9FLPFtbO3jSqJdDQy9wHUi2RxUqDb0mTOVAP7ViDEPZxel7POUKThKqGwDz/kL2sKb32W0dMnDfLI8zrmyP36KOHD9kKKuuo56h2AW7LJVHNodbJaWi3PBZO0abF8qlSAdwHZFko4jygtZnUMXOJ2unFeyzPKn5Od5GWciMZZiZbKnU5QTmPJ2nmGbEYTfZVGEBwaix7hnpZuamp9XLMEIx6QIeP6wC0fF0qfEKaWC5RVis3/foG1+oC7cR3OTkmQz4NCxarMMycwT0054X7UMxN6I2YawONTrSNpglwZzKkBuSExYwSTKAJjj6YJQwz0MHM5yHER5YfiF62tAFOpfzngtjmyvGm2zOmJna13Cz4S9XypnvstjNkM3tO8rk0lAFzXMgTJwrUEgaRCpkW7LreBEbXTQDawMKayxyheVWqVje/jRPUGoNyIxPhSa/T4Q9P2BmVSrWI6TzwgE76mgJmUf4NeIqkQKeYaA42KFOJzwUM9Ylq0vhTrgHC359nsCo5B/4rOpj4+OA5fCyW6jeJ9nxO9T85rE++Ww1QltQAVTf7rwE6Q4txjjeVu8Ba9sx7UgR8ep67uqzcHPWYfzGNkhTMY7C47wEnrTIkc9m6Ye6bC89bfWEs0JwkE2DMYcmBO5u7rNwk+tRMTLHXsSSPwMQyyDNcAoSSOTs5uc5km6UzD2QHCIv/sNmykp/5ERxMLLg9P88VajenCWvLnA2gKf6HuidYAzRq6jfRjroMrrTp0W1nsFJL4jDLFfC0nBnzAaTMB5cnmHt3bJKStWyma7ViDmlmr4qN/qZ5/rSYBJ9/wo8JWxKhcNb0DeZszi4UZvG2S2gepcsFGGnxzrPQDT4XiiQmh7gOdS9DOzZRTfJMMswznLIsEj8Tw3loOFALcpHOdUmYsD3JvZdqgL7V5HSeuFjZLDwCuavrAi1nh+f4iCmdR21NMgz2bXi4tVuQzId166RKDe1lsX7i+UtgSssLeNkthUET7wHXiSSsD7tOTitqvLipcj1Dbco5qWzO5vKfCMv8Ba4MOT9n1e0s3JHGTCycvaIV7cTRKF9DVA7Hvj+tpLXt9SqApnCSR5hXd6sBOgWLfqfJaYhKLy8/f76m9e/XVxD9f8Bul8UK+z7nHnhSn1dA1+8UncnNO80mfrnoLWa9XKhp4txHjRKaB5xTrm5xj7qXjciPJUD4cUGSWe+z52Q5liRZXB1EQi6imiynyWBiWH1Zpoth4Q/467pchAjtDMa4I3d7qyFMZmbvWJ2XoTD7LhuBu7okeXkqJ+UyGf3AvNcT1jYm9jH3mNuNzpV7tN29HTuqgF8A5rktXPvrhORsSp9IEVq5DqGhyqo9bniUc2/ZpbkpbuqoVMpjPA8YC5heuaS5s3wBxxz8Nx08imwmjJnZMyw3rm0pFsEnIJy7wPm3Ui1h7xwB80Qzs3c3s3fSzAwuQThSpjLAjfhEKibqp22xjz2hWOUwPNqaE7Omq6dEMwHm5neCOQaqWfxAelSpfrzJqc03cmMJLKgdlea+Cjg1dJa/vMDkTPGKrIWDP9DUFvJX8K9Lqut0kpplgDCea61oJ5MsH8iUWUdfpjCpZt6xoCufvwPMHKloT7sVH9CR5xyCT+iMvKmlUOZGkv921GVY0+XT/PvT01yxXv8+MNkEHVknkS1e108gQBhu2V4FNzrYTNchDCT+Ec59NQp5GOzypWrjRl3q5QxRzTKZ8aYwzxFmpb5ptrJSGdNjbuoElACa7eoajcKIimaeN2GC4zE8pJCuY2buUqoBks/o4QDBqIwV7aNWOe9hR6fwA8794Oxea1oC69YvMphGbqsnxXiteoZJ5kK58Vc5QJ2ejTt9U6HDZvayUK3RJbUKV/7hVOKkjkvcSchFHiifeY9DQ7lbZuaojJX95yzdTqrz8udk1qQlnTpK8vJg0XKIvdWdZzBZDVA/G202NfOyfnGngq7WKTCsJmiUPpHlmdWWleAP4ZMq5mxzcAq4iwqnzWSFeI2mS6Qymu+jmlPH0KRksjWbzZcbx4lNt1z+MDy2mTjChVpgTm+ONzUmzdhR/RPO5RWvof2t1pEHD0ZQHuMfD4gKDD3aPKkWJNW00lJLtbIRVmhyfkaVwNq2ckSCCUbwsdVqtbeJIFitJvUxs3Y89ejRI6sgnwOHWh89wtU4zcUmXSenaTENqc4nUYasm5phLEjERaM4A1PDlRwmeaeosTR6s+fnhZa57L9aRrjNz/USjBIfTjHQgAY/SSe26JY6WzitUatcQGfMlSqN8haMKI0KJgzyJIwcBRM2ohSdTgdmFSurcdS5KtUruNpIKrXMVtonOkAJiKEFmo1EW9o8f5IjaMpHiS6CdUDyeNos6Dotn6gey8RDA7PuBV2jI4kGrjNEp7BlueUot1nD8fTs9P1lsVJPb8lDLY5EZC77A0Rk32vIpNZjq1avFEmNBjReHtza2mdaaE9W2xYvMa2aK1XhyXBSGjotqbO96pZkeEjM5we28GTkEbd1jJp5mrlsXzj0APoG8TZyEGqfbbbmZgEmqc67PFcr6JE27tlqh4mRXrFzjW1TEjRsoTDfn3fWzeroKkfw1+lUnhx9azCRCQPDBzRiMDbWjlgnSaRP65X82TlNzaft33EvbbArJVyOiCE8NDnuX1BroNRhhMjRxfFZnNaoJYa24ClzuDIFPKKh4e4FQnXSgWHUxMTq1vF/chhQfqy0d9rRxwlonRwE6cXWLJgME6umylV1qdUbFXkpBN3TIPsew9/rzg1qmsvnmzAbn6hmthdB60ADyQO8B3OqHDaJ+1dCW3JKq9pvqicnp5nrOp3KO8fpz0btOyomRytXb8pwkxdkZv/i/MOHD7ipywXuxAH3eJ4rlCo1GDNHuHSDlOcXKvUeyxBJhVCRdIHSTUKHMC9IBrRamWpb0se5j27IMJTDNcfWhxoFzP/QMpv352cXuQt6P82/MmeZs3yp8p+tFphYaogNjWfkMi0nXVzgUxVy/1HCxNu6rHQsTRpltgUXz9YzU0qam5+h3+c+nOOqtg+5HJltKX26uMC9cC4KOAH+/UZMydx50o06TkshKSzUwI10Pmah355DqxSKZeiE6Odi+SE4pmh+eszaYZkisZ7vPxZRNREmtszHanmqI57cKhElAM+hqlhBDmjK/ymwgoxcLodbgLQIDo4fS5VCK8wi2ycEz/j4Mdd+Dvhg2QL7EglmDlz4dpik0JAMmx/adikYoTSLH7HX4K43uONIjn4jLs5sIMvvvLMjVqNhmRLgBHy5LEvRfbjIgtEtV6C/YQRqBW+uUi7kwV2p3/SczCYlDLn3ABNjtcTxf9Ah+vixVp5qX88CSnCD7tf5Rxirm3tB4BTYB4jp379/j2nCXLYDDHrHpUpFNoIMZhbO+JClucU2+u/fwwB8WmSaiV8MfjlcpBMm2SGmhnr+/rJUxGFTOZl7dEMaKnfO9jH6iBVGucI17gfxeWvk++/SOULLlMBVvcIZkMIlJnQKtMQRuhvuPQVu6dRpDWAWrjHq7BVLYS1sufARy66KcGTi+AQ3S7q8rBY6FieRkr5CAfdVKl41NzUANJUPRUm3cA+nXJumQYcDq9YK86pYyNKOiJs/wSltZ2Qvrz9fMzNIHKDCZfaqXFZZAYqJrmIxj8HmdbW21eKaeRK1m0aVbN/HWqlwdVkgm7SkPRz3A+y4KpcpNWrVSomVQ1XIpnCNI9za7qFpyJq4qVVr8PB1tCa63oUlDZy3L1dLtfpm4hrcJ6ytqpc7J0BGMBFUKdMvlIunMTlxXSn3lmq9Ud1UwLwCuLecUqtWmZlFzcR9f3AKRwUmOq5VclvVWmsZEHzfJmmoOtk8r0r3GbrBTVo2dd/V91G2KoRfY1uJo881RWau8ZkW3g/rsEumWeHT0XW6d8YKWvaIriROp4/Bcyc7geK/1ZZbmRJktQHdQnRKWtWRkM7pISefj5QwbzucypYM8/qYfW2iM/uLTyt/Sy1hbZtDIvU/5YaU0Kx9Pkrg1p8/CkuObWcwNrWlCLXpRqpsfZjVzWTM477tWnY2NQIH2+3usTH2T9Wl2SN0d2GcXZJfg8XZu2453CKKqp7+TpDOGOLkb7Xbh9T6o+J6blNnQ9k9ZDsjsoSJNhMp2/txhFF7gImwx+wJ1bde//u/aqHlqTUdDdWhyqOjP+AzmEZ09NaHTQ/bNtzvY598+ekVh956mtoBQ6bbRafrcne9pO+naX7LiOoewibdnd5L8N1EY/qR724gAxnIQAYykIEMZCBf4rM/fDg6At4w3e/yR7q1Xi/iGohqPG1VyqDtBvJNxEpTTtygf91/k8G5jzLHx9VEtz0pB3K/YJZPT+oDmH8TmIWT4wHMvwvM0slAMwcwBzKAOZBvD9ME4S/Ew6NSLoEExMoYBmUQwNwLmIL8qwGw+w7TxNm3yDuQp2hhkYmUqCiWt9rhF5tbnkFy4T5o5tYRviilXseN/UZhBE3cVGv1krS+x8pt3lTrPd9uNJAfBGZja6tRZm8aJK+iHOWm8icQf0pvKxnlErXj43J6kFX+8WEWjo5PT0pV+On09Lh2ZMeXBaSrJydVRo/mFgZO732AeXpSOalUjtJH1SrSxKWrVm6rDj/nqZ0l/zrJHHsGVvbHh3kKOrjptro3QR1PT/LHuDvI2HFe1sVRLg0w6+kBy/ugmVX2/g87oYlDJYySwK9C9qs0UbK1zYGVvQ8wCx4O9z/H9zidkEmUUfZjdQoAUitbOrIPApN74ABV02zJjcl+VCb/JIuxKszOmrh0jfw4sLL3I86UQhDERnTQSuws/oivvs7Aj1MDmPcMJhIs4GpYQHgCCKubnJ1Y2Wp6kJm9HzC3WmGSN/7KxtVqwpizvjVwf+4nTCzwom5PHsB6TjMQZI4N3J97Ymb5jjETXSAK2pQYBJn3CGYtLe3tINAsnqmppvAZ/m4QZN6XODNz4iGorNxUmcWZBCb8C2zuFjhC5UGQeW+SBhhZ4mr7UTkDRD4l/zwtnQ6KMe8RTKTpAZQelptlvg7LtsP/TwuDHPu9gVk6qZ6k0+kTedaEfYo52VPCelBNcl9g5o9A/aq1agZZVo/kHeyJC4QwB0HmPYF5enxc29q6OZUqDRSzljTbrjC8A/mxYZ7cNHBrzMRJA/dWrVfTHuWumphtPx3k2O+J2MmeWlO4RR9uhpZofaEFybafYoJ2YGXvkYwqtFUB07RZPxkEmfdGrKx03YyTIia5iJ0VuMvJ9kFD3X/Zqp6cZE4GQeb9dozGtjxjY57EWX7g/tx728ttQqxylKlnyOymaQDzXsNM1I8LhVPwZE/qWwPFvOe+baJKcwiVgZG9/6qZviGvZqkdDdYK3X8PCDcSxxyCfcDyb5lNGMi9ZWjFV3wOFr4PZCADGchABjKQgTAZNpnu+iaQgfyYMehdyQ+a7EemaXeP9ffuLM+YfTAT+iOL1TO1eRdRvj9tID+WjE1tTnnc9j4FVBhwDrTzxxTP5pT7bmfY4ZQBzR9SL1HNTKOjow/7E/KWDfeA5o8o9k3cKNF0NzEDTc/Apf3R5OEUqJjpzjIKCu0eRCg/VqYAmIx110tzD421Tk21Rac8kz93S21X+RqXvP3r/iY4p6a6A7NwZF+oLqrp2RwEKD9YhLnp6aaYZjPnGsNXTKvKQxhs25YeCU4bEeHP3JCFXsPJLsLriXw71fnW1/8rray9K0yLZsgfPdrqqpykHyhg6rnANJGIF37+0qblXBF6lQC9iBghIuq/TQPw7PpBG3fveZqIej1UQ2nWOIP/ePnf/ybGOKs67dGpqRaV4gJLiyBLT/x/BqZ3Bq+ysCTCz9C+4ZXFpaWllYjlWzQ2z/ERev3pvwlMtxpMi4bzT6/8Y+fmv/892eymnB0wF2ZB5mb+HMxpvMqMBDO4NAP/Wgx/K5hhev3I3xem2ayxiTOLs//Y+S9KosvI2QFzce7Jk7mFPwsTr6KE+eTJ7NI3hDmL1//7wkS1jCwtzD5hMP97rK6cA5g/PExwYkEtl2ahSSWYoJxulZFzAPNHhymr5RMlzP8eqSjnAOaPDVMaLeeetMH8703C3q6cA5g/NEyLRuOT1LINJijnVJtyDmD+wDDNFo0Ao+Xc3BNVmB3K2QKTt+hlmHr9F2Y7eT0vw4SL6AcwvximhvNGlhYlteyESZWzm2ZyCs1sbTJMyakns9lHyl+5ZM0k0gqzV1KcXKtHL1L5rr8vTLPJJk4vzc496QETldP0sBMmz3lFUYwskJNng/BzQGobvaWZBe1Ii8paTUiBFy2KwRm8ytxiBC9iU8KkR0lHd7sWp5pobZ6jPFsNpt5ipmLh7zFMCyc2R8tuMCFI4R53wtRzgaWlpUV22uLS4kqEZ6rEcWany+t1OY3kOKVJ5Tgj+ciGn/A4Xi7AVeSLLC1NO5sw8XBOsDlJGr9d//Azo9MLQhL07TjJ4Tb4Kvpdzem1Tpj830MzLdBwrSy7wBxVg+lfmJWVem52ZilM2gUa2SWGI9MzM9ORSNCvpMDjR5Fp8lEw4CRwvTNPZmebF1lUwISu4AoEIxG8TsDV1i3gPy+9FlxM9FnamMCxTjiXfhwEdZfO7oQJ9xDwU4Fv4f9HYZLxUpaZpQhpKs4VnF5ZWlxYWFhcXFqZCfvlZtZzgogfwWfwyeJ0wAjusHdmQXGVWQXMCJjg6UU8Ho5emhZdCprwkz/MvgYvNhPxW5Sw4S7w3EV6GysLeDavDpOkhmeILEb+h2GqaCbPBabBoYIPQGZnZhaWZkSBthA0cGRxcWZmjn40t7gYFHiEqbiIEmYQXbO5GUzkz87MLi5NN8MfPWcLzi0tzJBvwYstLM0FbfLH7C7m2Of4XXg2z6vAxAm4pTnsE/Cb+8bya8JEJZOGu8UF1Ez45Sx1qLAVCZ+FpSChyfM2aLVZwn0Gv3T2yVLQyHlnQfPYRRbgIhLMucXpyNJs8+ZmZ5fkYJYAWFD6bfg1EVfTlIr/3+Ks8sHwbJFTgannnPA1eLMzS9MuTv+/O2ZOw5DFGhN/DKJGzBGHanaW9HXy49xSEMMDHiFB+8+ix7OIpOeeLAQgLAGZJX1iYQanuRlMoLlIyUtUYDylU+Co4swFJx2D/SQpFnyXuMjcOjydMocbCqCX1AoTVDxCW2BWuvr/JEzwFcFTFBdonBlAF9UMRpPErGAUyRhELj73ZNGPYQQaVNThmUgwOL2I50GDCkbwN/0kzgTDihcRGEwAQRQOydN7xPbHXsELYXoE7RiSjoKdF9CS8px/lrIEq42n049naZqqBaaFE4L3meVXhEmSBguKpAHPuvnc0nTQ7/X6wAeZfSK3m8isp1/gzTYRh0oYzPzdkgaMFXiykenFJYkmTfiJNMsxN7c0g/UfM0tPqEVfREvK8y76tdilyOksKQK34cT8g1IzhSBFDSz995DlV4TJ6y16GSb8LPm3c0thFz3CGVwivwALxwsRZLQwy3JFIvFCV0TOYtE303l4ERkmtLDotQk2VyCyNCepJmfmGCzwWsJ+myDY/MHZBUbEhSZApM80hx6wYBRcmBeR+4ISJs+Li0/omTP3kuVX1UyzQjOhmWyRRanPk/o3S/M3FnA04Me5hWmXxYJZNtv0k+mwSMNHtUQ70xbWKcKE1tyTuQBRccpyRjSyz8UnjCZewSXbA5eULqQGYxYrRfRKzRQXKEsYJu4ly28G0wIe0Qy2N/7DSKsZjZx/QVIZJ2lRqpkI2u93GnvMmrAeggneppsysxJEFaeKCeQ4+jEa3ieMFvhgjBz4xeR0vb6py9gXmjADC6wPzN5Tlt8OJhvLMNpXOEnTRB/hc2pmccx0DskesYXvChP8ITlHh/1kgRwC6kTTDMRMMgJ6BnhuYc7LWcgjzWGvsShm6lhf4BWaKc6wXjEr3lOW3w4m4qKt5FcI4xSQrefiwnRQ9IPTyvH6HpoJ1/QpsgBGcu05VHE6UYNapu/IRsEvndOsSwmK5Q626abTQ2FCIES9azAmIndfK6K/HUyn5EUqZIZGDeDoMOXCSAXcy5mI6GX50i6T0y2lkODVsLk2L/WK0XLzTZi8d5qqaxCjI3Yx5VRJUO4LEswndLyEXwbvLctvCpO1klJY3hbGOovspc7MYt52JuiSk6NqlQZBXpk3DyySQe+Jn97y7JKyhplngyp+j2SQA7KVbe0LegkmZYkzbzZ+ALMdphTfzSlVk6XKgsM0b8PyMXNwzALJl/aA2TIJ4qeNv+DnpCHPqIRpJCMyJvv9s1RHW2GySfRZnwKmlOpbGpjZ7jAXFttlAclgRnVxqZmcx2woZl36hEl1HAZFSTMFJUxLE+ZMD5hz/k6Yf66C6W8+ZpIUa5uQLLeeEwKRmaUlGKykBBxauH4KuvQ8o0HM7AyLPFTMbJg5u2hmFTNmvJqZRQPxRE42DGC2wKQuIzg7NmeHCGxG2eYXI9MLoKDU+UCXtJsDNO1UTmsHaewhOUD4k7oD5JISvV0cIAXMOTZfAwdb7qehvRXmzZfC1MtOiKpgcRX+LbgAKPVsSZN3CU2ePAkoQhObIjSZww9ptkcxtyqFJizppHRr8PTF9tCE/JPlH57M/h0zQHOz/3j7J5IGUoPzerauHVQmEnAZ5RMEp4U0mtEvR4NYbaCeNIgY5awAIziDx7OkAc3NdSYNeOY0LzQHTYk19jMpaUAT716W+ruvhrYXzNmFlelQ+ovTeVJuJkhSbCQrYAkvLUxDTCkAR78YjERsbNUyScDN4lx0F5ggLF/XzMeR6LEzncexdB70IxubyJGy7vR0b2c6jx4gJRuw4ug+GtruMGefQOwHofxm+gsT7TRjRylwxKjy4pPZucWlFWg3cXoG6/BQhXneYiFOJ5scU4epyKR72dQaTjpaWPIV4gyRrZs3imzaBK4gh7twbS+7zab+NRPt9Fq8UR5Axb/TFNjs7NJC2G/WPBzlHm8dfQFM2ZpBMwddZsyJuoKYZpmbWQTrKC49IUtcXdQTCsrTKeZumjm3sAA22unyB1nMA2YSyy+dEWkKDD624QyZlDAnuXVpuhP+GfQ6bU6vKGWmOqfAmnMsizN/n8lpnJSP+AWNyWIyWeGQrZO7w+TZnCX8e3E6LIpimBYUAE4/R5ZHk3xLwCUMu0RmkcVu3ixN0SyRepQVlowgkQXNBtEyIzThkekndHXF3NxigExO2yLSHNrSzHQEDII8OW1rn5wmlUxzijKGvwFMgjJg44YsZrJzgZXjxhJXd4WJRe5scJrFiecVVrEBCmXkpWzeLAWwuCDHfd1gknDxCaYcZpqFBlgWojcGWQnQLH68+ITlneBr9LRsRE4SY/6CliJJhSFtMHm9XDhyHxNBnTCx6adFJ6ehKCWcnsTNHWFiO84s0gEPa4Bomd4MqbRCg0ZpwhhKC7poypbvBhN0dw7zfmxR05ysOzxnC7PCPUwLzskFXXJVc2CGLZ8hn7NyMDoBrVJqKXlH9zAR1AFzZgHrKzQKlO04e8KExpx9IrUDluwtzSqKIOdm5ljVHH60SGssZ2nZHsYGxNKhBcYEbhMmXHMxGFSUWs7BXUacciGzLbi0MKMstZxZVHyMNJVlmphxWmIb09ANKubmFEXQEPZgBpkOufcbJlZfedtRSjin0rfBXHyysPBkQVHSCp7nEuFF8u0LS4tSPSvSXFmcI7l3/GNxUaIMmvkEi5BlmLPg0SwFYexbYkn7uYWlWUWVM6mNX1JeC/pj82O0EOwuyMfgpi+Aa8tKsfkIvT6DSQYAUgU9h/7V/YM51oS5gtGIxmJR3SrPSuOUJszOfYBIZf9s00JJCdilxQWsc5yJBITmRy7wS/ETUkApNT/CfEIqMyWYi/ivhSASw2vgwTMRP9eSn+O80rXwz2kMqVqmzGxiZE7tLgAmu75klXE6h65PmJ0N3MPlCdI+iAAz4jdzZkvXnQ9NnHXrWIbZvkMXzzl9XiLNyUU9JmCDdM+tSNAvcMopZrISiH6CtVysMQV6DR+zky5yTZ+Lp4t/QMKi19i6MojvvFb7wiGSBiafi36bctmRi92z0PEbn+veBSeKvfOGgILJ0mtfUlBOt0d6ZUbn3nmqOViSt8Mlfe1r7eR1di61VXhdrmSzCRqO6xjN9PK1bJxcgtJ2rpHchf6277rXa26npmRWmqHOwbJz6FRsOGtv3XCWbVrY2la8vAy2YxWs/Ate+UnrRRQbIbKjeNXVtMoT1BP76nch3XPnb/T3MNBEJPJ+eX1sGjyqWAXf59tQVBagK1vuDuF5z61h+d4E+Dt+130U6+bUkOlLdoJ2g5Ud7AT9QwluBe3hdHdnCZ1gdNB8P5yl9YCKcaMP74ISXNmpwT7QPyTNqU3PY47rf9d9ONY+teketNyPKBrP5pTHbh3q8/BRO76hyD4YMH9Qsd/tVWCDt0f94E5tv+/oI6/pG7xC84f2aQfyt3KDTMN9Chw5aK6BDGQgAxnIQAYykIEMZCADGchABjKQryz/D6KJARt0Sy4vAAAAAElFTkSuQmCC";
/* ============================================================
   DATA — mock GC Buddy student directory + admin roster.
   >>> INTEGRATION POINT 1: replace STUDENTS with a live lookup
       against the GC Buddy Roll Number database (API/secure call).
   >>> INTEGRATION POINT 2: replace ADMINS with your identity
       provider / role-based access control (RBAC).
   Grievances, notes, remarks, audit history + notifications are
   stored in the Artifact `db` capability (shared, real-time) so a
   student submission is genuinely visible to the admin team.
   ============================================================ */
/* Student directory, admin accounts & demo seed data live in api.js (GCApi). */

const CATEGORIES = {
  "Course & Curriculum":{dept:"Academics",icon:"book",types:["Course content-related issues","Doubts regarding syllabus","Study material not accessible","Class recordings","Learning progress","Other curriculum-related issues"]},
  "EMI & Payment":{dept:"Finance",icon:"card",types:["EMI-related queries","Payment not reflecting","Payment confirmation","EMI schedule","Payment receipt","Other payment-related issues"]},
  "Batch Schedule":{dept:"Operations",icon:"cal",types:["Class timing issues","Batch change request","Faculty-related concerns","Class cancellation","Missed classes","Google Meet joining issues","Other batch-related issues"]},
  "Call Back Request":{dept:"Operations",icon:"phone",types:["Request a call from the support team","Academic counselling callback","Payment / EMI callback","Technical support callback","Other callback"]},
  "GC Buddy App":{dept:"Tech Support",icon:"app",types:["Login issues","Roll number not working","AI Tutor issues","Listening & Speaking practice","Course access issues","Technical glitches","Other app-related issues"]}
};
const STATUSES=["Submitted","Under Review","In Progress","Awaiting Student Response","Resolved"];
const STATUS_CLASS={"Submitted":"s-submitted","Under Review":"s-review","In Progress":"s-progress","Awaiting Student Response":"s-awaiting","Resolved":"s-resolved","Closed":"s-closed"};
const TIME_SLOTS=["09:00–11:00 AM","11:00 AM–01:00 PM","01:00–03:00 PM","03:00–05:00 PM","05:00–07:00 PM"];
const SLA_DAYS=(window.GC_CONFIG&&GC_CONFIG.slaDays)||3; // open grievance older than this => overdue

/* ---------- icons ---------- */
const I={
  grid:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  plus:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  list:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  track:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M11 7v4l2.5 2.5"/></svg>',
  phone:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
  bell:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
  book:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  card:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20" stroke-linecap="round"/></svg>',
  cal:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2.5"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  app:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M12 18h.01"/></svg>',
  analytics:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l3-4 3 3 4-6"/></svg>',
  users:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
  logout:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>',
  search:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>',
  menu:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>',
  check:'<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  globe:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" stroke-linecap="round"/></svg>',
  clip:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.4 11.1l-9 9a5 5 0 0 1-7-7l9-9a3.3 3.3 0 0 1 4.7 4.7l-9 9a1.7 1.7 0 0 1-2.4-2.4l8.3-8.2"/></svg>',
  dl:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
  shield:'<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M12 2l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V5l8-3z" opacity=".25"/><path d="M12 2l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V5l8-3z" fill="none" stroke="#fff" stroke-width="2"/></svg>'
};

/* ============================================================
   STATE + STORE
   ============================================================ */
const state={
  booting:true, db:null, user:null, canWrite:true, dbNote:false,
  session:null,            // {type:'student'|'admin', ...}
  grievances:{},           // id -> doc
  view:'dashboard',
  loginTab:'student', authMode:'student', loginErr:'',
  current:null,            // open grievance id
  draft:{},                // transient form drafts (notes etc.)
  filters:{q:'',cat:'',status:'',dept:'',from:''},
  myFilter:'all',
  railOpen:false, notifOpen:false, lastSeen:0, suspendSync:false
};

const ls={
  get(k,d){try{const v=sessionStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{sessionStorage.setItem(k,JSON.stringify(v))}catch(e){}},
  del(k){try{sessionStorage.removeItem(k)}catch(e){}}
};

/* ---- db wiring ---- */
async function initApi(){
  try{
    await GCApi.init();
    GCApi.subscribe(list=>{
      const map={}; list.forEach(g=>{ map[g.id]=g; });
      state.grievances=map;
      // Background sync (live-mode polling) must not rebuild the DOM while the
      // user is mid-input, or it wipes what they're typing. Skip auto-render:
      //  - during form submission guard (suspendSync)
      //  - on the login screen (no session yet; its inputs aren't in state)
      //  - whenever a field is focused (don't interrupt typing anywhere)
      if(state.suspendSync || !state.session) return;
      const ae=document.activeElement;
      if(ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return;
      render();
    });
  }catch(e){ state.dbNote=true; render(); }
}


async function saveGrievance(g){
  state.grievances[g.id]={...g};         // optimistic update
  try{ await GCApi.create(g); }
  catch(e){ toast('Could not save — please check your connection.','warn'); }
}
async function patchGrievance(id,patch){
  const cur=state.grievances[id]; if(!cur) return;
  const next={...cur,...patch};
  state.grievances[id]=next;              // optimistic update
  try{ await GCApi.update(id,next); }
  catch(e){ toast('Update failed — please check your connection.','warn'); }
}

/* ============================================================
   HELPERS
   ============================================================ */
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=s=>document.querySelector(s);
function newId(){
  const d=new Date(); const yy=String(d.getFullYear()).slice(2);
  const mm=String(d.getMonth()+1).padStart(2,'0');
  let r=''; const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; for(let i=0;i<4;i++)r+=A[Math.floor(Math.random()*A.length)];
  return `GC-${yy}${mm}-${r}`;
}
function fmtDate(iso){ if(!iso)return '—'; const d=new Date(iso);
  return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); }
function fmtDateTime(iso){ if(!iso)return '—'; const d=new Date(iso);
  return d.toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}); }
function ago(iso){ if(!iso)return ''; const s=(Date.now()-new Date(iso))/1000;
  if(s<60)return 'just now'; if(s<3600)return Math.floor(s/60)+'m ago';
  if(s<86400)return Math.floor(s/3600)+'h ago'; return Math.floor(s/86400)+'d ago'; }
function daysOpen(g){ return (Date.now()-new Date(g.submittedAt))/86400000; }
function isOpen(s){ return s!=='Resolved'&&s!=='Closed'; }
function isOverdue(g){ return isOpen(g.status) && daysOpen(g)>SLA_DAYS; }
function statusPill(s){ return `<span class="pill ${STATUS_CLASS[s]||'s-submitted'}">${esc(s)}</span>`; }
function initials(n){ return (n||'?').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase(); }

function myGrievances(){
  const roll=state.session?.roll;
  return Object.values(state.grievances).filter(g=>g.roll===roll)
    .sort((a,b)=>new Date(b.submittedAt)-new Date(a.submittedAt));
}
function allGrievances(){
  return Object.values(state.grievances).sort((a,b)=>new Date(b.submittedAt)-new Date(a.submittedAt));
}
function summary(list){
  const s={total:list.length,open:0,prog:0,res:0};
  list.forEach(g=>{ if(g.status==='In Progress')s.prog++;
    else if(g.status==='Resolved'||g.status==='Closed')s.res++;
    else s.open++; });
  return s;
}

/* student-visible events -> notifications */
function myNotifs(){
  const roll=state.session?.roll; const out=[];
  myGrievances().forEach(g=>{
    (g.audit||[]).forEach(a=>{ if(a.student){ out.push({...a,gid:g.id,cat:g.category}); } });
  });
  return out.sort((a,b)=>new Date(b.at)-new Date(a.at));
}

function toast(msg,kind){
  const w=$('#toasts'); const el=document.createElement('div');
  el.className='toast '+(kind||''); el.innerHTML=`<div>${esc(msg)}</div>`;
  w.appendChild(el); setTimeout(()=>{el.style.opacity='0';el.style.transition='.3s';setTimeout(()=>el.remove(),300)},4200);
}

/* ============================================================
   AUTH
   ============================================================ */
async function studentLogin(){
  const name=($('#sname').value||'').trim();
  const roll=($('#roll').value||'').trim().toUpperCase();
  if(!name){ state.loginErr='Please enter your name.'; return render(); }
  if(!roll){ state.loginErr='Please enter your GC Buddy Roll Number.'; return render(); }
  let rec=null;
  try{ rec = await GCApi.lookupStudent(roll); }
  catch(e){ state.loginErr='Could not reach the student directory. Please try again.'; return render(); }
  // To ENFORCE that only registered GC Buddy students may log in, uncomment:
  // if(!rec){ state.loginErr='Roll number not found in GC Buddy. Please check and try again.'; return render(); }
  rec = rec || {course:'',batch:'',mobile:'',email:''};
  state.session={type:'student',roll,...rec,name};
  ls.set('gc_session',state.session); state.loginErr=''; state.view='mine';
  state.lastSeen=ls.get('seen_'+roll,0); render();
  toast('Welcome, '+name.split(' ')[0]+'!','ok');
}
async function adminLogin(){
  const u=($('#auser').value||'').trim(); const p=$('#apass').value||'';
  let rec=null;
  try{ rec = await GCApi.adminLogin(u,p); }
  catch(e){ state.loginErr='Could not reach the server. Please try again.'; return render(); }
  if(!rec){ state.loginErr='Invalid admin credentials.'; return render(); }
  state.session={type:'admin',user:u,...rec};
  ls.set('gc_session',state.session); state.loginErr=''; state.view='admin-queue'; render();
  toast('Signed in as '+rec.name+' · '+rec.role,'ok');
}
function logout(){ state.session=null; ls.del('gc_session'); state.view='mine'; state.current=null; state.notifOpen=false; render(); }

/* ============================================================
   RENDER ROOT
   ============================================================ */
function render(){
  const app=$('#app'); if(!app)return;
  if(state.booting){ return; }
  if(!state.session){ app.innerHTML=viewAuth(); return; }
  app.innerHTML = state.session.type==='admin' ? shell(adminBody(),true) : shell(studentBody(),false);
}

function shell(body,isAdmin){
  const s=state.session;
  const nav = isAdmin ? [
    ['admin-queue',I.list,'Grievance Queue',null],
    ['admin-callbacks',I.phone,'Callback Requests',null],
    ['admin-analytics',I.analytics,'Analytics',null],
    ['admin-team',I.track,'SLA Tracking',null]
  ] : [
    ['raise',I.plus,'Raise a Grievance',null],
    ['mine',I.list,'My Grievances',String(myGrievances().length)],
    ['callback',I.phone,'Request a Callback',null]
  ];
  const navHtml=nav.map(([v,ic,lab,ct])=>`<button class="navitem ${state.view===v||(v==='admin-queue'&&state.view==='admin-detail')||(v==='mine'&&state.view==='detail')?'active':''}" onclick="go('${v}')"><span class="ico">${ic}</span>${esc(lab)}${ct?`<span class="count">${ct}</span>`:''}</button>`).join('');
  return `
  ${state.railOpen?'<div class="scrim" onclick="app.toggleRail(false)"></div>':''}
  <div class="shell">
    <aside class="rail ${state.railOpen?'open':''}">
      <div class="brand"><div class="logo-chip"><img src="${LOGO}" alt="Global Careers by Testbook"></div>
        <div class="brand-sub">Support<small>Portal</small></div></div>
      <nav>${navHtml}
      </nav>
      <div class="who"><div class="avatar">${initials(s.name)}</div>
        <div style="min-width:0;flex:1"><div style="font-weight:700;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(s.name)}</div>
        <div style="font-size:11.5px;color:var(--muted)">${isAdmin?esc(s.role):esc(s.roll)}</div></div>
        <button class="btn ghost sm" title="Log out" onclick="logout()">${I.logout}</button></div>
    </aside>
    <div class="main">
      <div class="topbar">
        <button class="menu-btn" onclick="app.toggleRail(true)">${I.menu}</button>
        <div style="font-weight:700;font-size:15px">${esc(topTitle())}</div>
        <div style="margin-left:auto;display:flex;gap:10px;align-items:center">
          ${!isAdmin?notifBell():''}
        </div>
      </div>
      <div class="content">${body}</div>
    </div>
  </div>`;
}
function topTitle(){
  const m={dashboard:'Dashboard',raise:'Raise a New Grievance',mine:'My Grievances',track:'Track Issue Status',
    callback:'Request a Callback',detail:'Grievance Details','admin-queue':'Grievance Queue',
    'admin-detail':'Grievance Details','admin-analytics':'Support Analytics','admin-team':'SLA Tracking','admin-callbacks':'Callback Requests'};
  return m[state.view]||'Support Portal';
}

/* ============================================================
   AUTH VIEW
   ============================================================ */
function viewAuth(){
  const admin = state.authMode==='admin';
  return `<div class="auth"><div class="auth-card">
    <div class="auth-hero">
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px">
        <div class="logo-chip lg"><img src="${LOGO}" alt="Global Careers by Testbook"></div>
      </div>
      <h1 style="font-size:21px;font-weight:800">${admin?'Support Team Console':'Student Grievance & Support Portal'}</h1>
      <p style="font-size:13.5px;opacity:.92;margin-top:6px">${admin?'Internal access for the Global Careers support team.':'Raise academic, payment, batch or app issues and track them to resolution. We are here to help.'}</p>
    </div>
    <div class="auth-body">
      ${state.loginErr?`<div class="err">⚠ ${esc(state.loginErr)}</div>`:''}
      ${admin?`
        <label class="fld"><span>Admin Username <span class="req">*</span></span>
          <input id="auser" placeholder="username" autocomplete="off"></label>
        <label class="fld"><span>Password <span class="req">*</span></span>
          <input id="apass" type="password" placeholder="••••••••" onkeydown="if(event.key==='Enter')adminLogin()"></label>
        <button class="btn primary block" onclick="adminLogin()">Access admin console →</button>
        <p style="font-size:11.5px;margin-top:16px;text-align:center"><a href="#" onclick="app.goStudent(event)" style="color:var(--muted);text-decoration:none">← Back to student login</a></p>
      `:`
        <label class="fld"><span>Full Name <span class="req">*</span></span>
          <input id="sname" placeholder="Your full name" autocomplete="name" onkeydown="if(event.key==='Enter')document.getElementById('roll').focus()"></label>
        <label class="fld"><span>GC Buddy Roll Number <span class="req">*</span></span>
          <input id="roll" placeholder="e.g. GCB2024001" autocomplete="off" onkeydown="if(event.key==='Enter')studentLogin()"></label>
        <button class="btn primary block" onclick="studentLogin()">Log in securely →</button>
        <p style="font-size:11.5px;color:var(--faint);margin-top:16px;text-align:center;line-height:1.6">🔒 Only registered Global Careers students can access the portal. Your details are safe — no spam.</p>
      `}
    </div>
  </div>
  ${admin?'':`<button class="admin-fab" onclick="app.goAdmin(event)" title="Support team login">🔒 Admin login</button>`}
  </div>`;
}

/* ============================================================
   STUDENT — DASHBOARD
   ============================================================ */
function studentBody(){
  switch(state.view){
    case 'raise': return viewRaise();
    case 'callback': return viewRaise(true);
    case 'mine': return viewMine();
    case 'detail': return viewDetail(false);
    default: return viewMine();
  }
}
function dbBanner(){
  if(state.dbNote) return `<div class="banner">⚠ Shared sync is unavailable in this view — grievances you raise now stay in this session only. Open the portal as the owner (or a team member) for full persistence.</div>`;
  return '';
}
function viewDashboard(){
  const s=state.session; const list=myGrievances(); const sm=summary(list);
  const recent=list.slice(0,3);
  return `${dbBanner()}
  <div class="page-h"><div><div class="eyebrow">Welcome back</div>
    <h1>Welcome, ${esc(s.name.split(' ')[0])}! 👋</h1>
    <p>We're here to help you. Raise an issue and our team will assist you.</p></div></div>

  <div class="card pad" style="margin-bottom:22px">
    <div style="display:flex;flex-wrap:wrap;gap:18px 34px">
      ${[['Student Name',s.name],['GC Buddy Roll No.',s.roll],['Registered Course',s.course],['Batch',s.batch],['Mobile',s.mobile]]
        .map(([k,v])=>`<div><div style="font-size:11.5px;color:var(--muted);font-weight:600">${k}</div><div style="font-weight:700;margin-top:2px">${esc(v)}</div></div>`).join('')}
    </div>
  </div>

  <div class="stats" style="margin-bottom:22px">
    ${statTile('all','Total Grievances',sm.total,'var(--accent)')}
    ${statTile('open','Open Issues',sm.open,'var(--sky)')}
    ${statTile('prog','In Progress',sm.prog,'var(--warn)')}
    ${statTile('res','Resolved',sm.res,'var(--ok)')}
  </div>

  <div class="sectionlabel">What would you like to do?</div>
  <div class="actions" style="margin-bottom:26px">
    ${actionCard('b1',I.plus,'Raise a New Grievance','Report an academic, payment, batch or app issue.','go(\'raise\')')}
    ${actionCard('b2',I.list,'My Grievances','View every request you\'ve submitted so far.','go(\'mine\')')}
    ${actionCard('b4',I.phone,'Request a Callback','Ask the support team to call you back.','go(\'callback\')')}
  </div>

  <div class="sectionlabel">Recent activity</div>
  ${recent.length?`<div class="glist">${recent.map(gRow).join('')}</div>`:emptyState('No grievances yet','Raise your first issue and it will appear here.')}
  `;
}
function statTile(t,lab,num,color){
  return `<div class="stat t-${t}"><div class="lab"><span class="dot" style="background:${color}"></span>${lab}</div><div class="num tnum">${num}</div></div>`;
}
function actionCard(b,ic,t,d,on){
  return `<button class="action" onclick="${on}"><div class="ai ${b}">${ic}</div><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></button>`;
}
function emptyState(t,d){
  return `<div class="card empty"><div class="ei">${I.list}</div><h3 style="font-size:16px">${esc(t)}</h3><p style="margin-top:6px;max-width:340px;margin-inline:auto">${esc(d)}</p></div>`;
}

/* grievance row (shared) */
function gRow(g){
  const over=isOverdue(g);
  return `<div class="grow" onclick="openGrievance('${g.id}')">
    <div style="min-width:0">
      <span class="gid">${esc(g.id)}</span>
      <div class="gtitle">${esc(g.brief||g.issueType)}</div>
      <div class="gmeta">
        <span class="badge">${esc(g.category)}</span>
        ${g.issueType?`<span>•</span><span>${esc(g.issueType)}</span>`:''}
        <span>•</span><span>Raised ${fmtDate(g.submittedAt)}</span>
        ${over?'<span class="badge hot">⏱ Overdue</span>':''}
      </div>
    </div>
    <div class="gright">${statusPill(g.status)}
      <span style="font-size:11.5px;color:var(--faint)">Updated ${ago(g.updatedAt)}</span></div>
  </div>`;
}

/* ============================================================
   STUDENT — MY GRIEVANCES / TRACK
   ============================================================ */
function viewMine(){
  const list=myGrievances();
  return `${dbBanner()}
  <div class="page-h"><div><h1>My Grievances</h1><p>Everything you've raised, newest first.</p></div>
    <div style="margin-left:auto"><button class="btn primary sm" onclick="go('raise')">${I.plus} New grievance</button></div></div>
  ${list.length?`<div class="glist">${list.map(gRow).join('')}</div>`:emptyState('No grievances yet','Raise your first issue and it will appear here.')}`;
}
function viewTrack(){
  const list=myGrievances();
  const groups={};
  STATUSES.forEach(s=>groups[s]=[]);
  list.forEach(g=>groups[g.status]?.push(g));
  return `${dbBanner()}
  <div class="page-h"><div><h1>Track Issue Status</h1><p>Your grievances grouped by their current stage.</p></div></div>
  ${list.length? STATUSES.filter(s=>groups[s].length).map(s=>`
    <div class="sectionlabel" style="display:flex;align-items:center;gap:10px">${statusPill(s)} <span style="color:var(--faint)">${groups[s].length}</span></div>
    <div class="glist" style="margin-bottom:8px">${groups[s].map(gRow).join('')}</div>`).join('')
    : emptyState('No issues to track','Once you raise a grievance, you can follow it here.')}`;
}

/* ============================================================
   RAISE FORM (+ callback mode)
   ============================================================ */
function viewRaise(callbackMode){
  const d=state.draft;
  const cat = callbackMode? 'Call Back Request' : (d.category||'');
  const cfg = CATEGORIES[cat];
  state.suspendSync=true; // don't let live sync wipe the form
  return `${dbBanner()}
  <div class="page-h"><div><div class="eyebrow">${callbackMode?'Callback':'New request'}</div>
    <h1>${callbackMode?'Request a Callback':'Raise a New Grievance'}</h1>
    <p>${callbackMode?'Our team will call you at your preferred time.':'Pick a category, describe the issue, and submit. You\'ll get a Grievance ID instantly.'}</p></div></div>
  <div class="grid" style="grid-template-columns:1fr;max-width:720px">
    <div class="card pad">
      <label class="fld"><span>Category <span class="req">*</span></span>
        <select id="f_cat" ${callbackMode?'disabled':''} onchange="app.pickCat(this.value)">
          <option value="">Select a category…</option>
          ${Object.keys(CATEGORIES).map(c=>`<option ${c===cat?'selected':''}>${c}</option>`).join('')}
        </select>
        ${callbackMode?'<div class="hint">Category auto-filled for callback requests.</div>':''}
      </label>

      ${cat?`
      <label class="fld"><span>Brief description of the issue <span class="req">*</span></span>
        <input id="f_brief" maxlength="120" placeholder="One line summary" value="${esc(d.brief||'')}"></label>

      <label class="fld"><span>Detailed explanation <span class="req">*</span></span>
        <textarea id="f_detail" placeholder="Explain what happened, when, and what you've tried…">${esc(d.detail||'')}</textarea></label>

      ${cat==='Call Back Request'?`
        <div class="grid" style="grid-template-columns:1fr 1fr">
          <label class="fld"><span>Preferred date <span class="req">*</span></span><input id="f_cbdate" type="date" value="${esc(d.cbdate||'')}"></label>
          <label class="fld"><span>Preferred time slot <span class="req">*</span></span>
            <select id="f_cbslot"><option value="">Select…</option>${TIME_SLOTS.map(s=>`<option ${d.cbslot===s?'selected':''}>${s}</option>`).join('')}</select></label>
        </div>
        <label class="fld"><span>Contact number <span class="req">*</span></span>
          <input id="f_cbnum" placeholder="${esc(state.session.mobile)}" value="${esc(d.cbnum||state.session.mobile)}"></label>
      `:''}


      <div style="display:flex;gap:10px;margin-top:6px">
        <button class="btn primary" onclick="submitGrievance(${callbackMode?'true':'false'})">${I.check2||''}Submit ${callbackMode?'Callback Request':'Grievance'} →</button>
        <button class="btn ghost" onclick="app.clearDraft()">Reset</button>
      </div>
      `:'<p style="color:var(--muted);font-size:13.5px">Select a category above to continue.</p>'}
    </div>
  </div>`;
}
function fileChip(f){ return `<div class="file-chip">${I.clip} ${esc(f.name)} · ${(f.size/1024).toFixed(0)} KB <button class="btn ghost sm" style="padding:2px 6px" onclick="app.removeFile()">✕</button></div>`; }

function submitGrievance(callbackMode){
  const g=(id)=>document.getElementById(id);
  const val=id=>g(id)?.value?.trim()||'';
  const cat=callbackMode?'Call Back Request':val('f_cat');
  const type='', brief=val('f_brief'), detail=val('f_detail');
  if(!cat){ toast('Please choose a category.','warn'); return; }
  if(!brief){ toast('Please add a brief description.','warn'); return; }
  if(!detail){ toast('Please add a detailed explanation.','warn'); return; }
  let cb=null;
  if(cat==='Call Back Request'){
    const date=val('f_cbdate'),slot=val('f_cbslot'),num=val('f_cbnum');
    if(!date||!slot||!num){ toast('Please fill the callback date, slot and number.','warn'); return; }
    cb={date,slot,num};
  }
  const s=state.session; const now=new Date().toISOString(); const id=newId();
  const dept=CATEGORIES[cat].dept;
  const g0={
    id, roll:s.roll, studentName:s.name, course:s.course, batch:s.batch, mobile:s.mobile,
    category:cat, issueType:type, brief, detail, preferred:val('f_res'),
    callback:cb, attachment:state.draft.file||null,
    status:'Submitted', dept, assignee:'', submittedAt:now, updatedAt:now, reopened:false, lastStudentMsg:{text:detail,at:now},
    notes:[], remarks:[],
    audit:[{at:now,by:s.name,action:'Grievance submitted',to:'Submitted',student:true,
      text:'Your grievance has been received. Our '+dept+' team will review it shortly.'}]
  };
  saveGrievance(g0);
  state.suspendSync=false; state.clearDraftSilent&&state.clearDraftSilent();
  state.draft={};
  showSuccess(g0);
}
function showSuccess(g){
  const o=document.createElement('div'); o.className='overlay'; o.id='successOverlay';
  o.innerHTML=`<div class="modal">
    <div class="success-ring">${I.check}</div>
    <h2 style="font-size:20px">Grievance submitted successfully!</h2>
    <p style="color:var(--muted);margin-top:8px">Your grievance will be sent to the <b>Global Careers team</b> and will be resolved soon.</p>
    <div style="background:var(--surface-2);border:1px dashed var(--border-strong);border-radius:10px;padding:14px;margin:18px 0">
      <div style="font-size:11.5px;color:var(--muted);font-weight:600">YOUR GRIEVANCE ID</div>
      <div style="font-family:var(--fm);font-size:22px;font-weight:700;color:var(--accent);margin-top:3px">${esc(g.id)}</div>
    </div>
    <p style="font-size:13px;color:var(--muted)">You'll be able to see every update right here in your portal. 🔔</p>
    <div style="display:flex;gap:10px;margin-top:20px">
      <button class="btn primary block" onclick="app.closeSuccess('${g.id}')">View grievance</button>
      <button class="btn block" onclick="app.closeSuccess()">Back to My Grievances</button>
    </div></div>`;
  document.body.appendChild(o);
}

/* ============================================================
   GRIEVANCE DETAIL (student view=read, admin=editable)
   ============================================================ */
function openGrievance(id){ state.current=id; state.view = state.session.type==='admin'?'admin-detail':'detail'; state.railOpen=false; render(); }

function viewDetail(isAdmin){
  const g=state.grievances[state.current];
  if(!g) return `<button class="btn ghost sm" onclick="goBack()">← Back</button>${emptyState('Grievance not found','It may have been removed.')}`;
  const over=isOverdue(g);
  const lastStu = g.lastStudentMsg || (g.detail?{text:g.detail,at:g.submittedAt}:null);
  const auditHtml=(g.audit||[]).slice().reverse().map(a=>`
    <div class="tl ${a.kind||''}"><div class="tdot"></div>
      <div><div class="ttxt">${esc(a.action)}${a.to?` → ${statusPill(a.to)}`:''}</div>
        ${a.text?`<div style="font-size:13px;color:var(--muted);margin-top:3px">${esc(a.text)}</div>`:''}
        <div class="tmeta">${esc(a.by)} · ${fmtDateTime(a.at)}</div></div></div>`).join('');
  const remarksHtml=(g.remarks||[]).map(r=>`<div class="remark"><b>${esc(r.by)}</b> · ${fmtDateTime(r.at)}<div style="margin-top:4px">${esc(r.text)}</div></div>`).join('')
    || '<p style="color:var(--faint);font-size:13px">No resolution remarks yet.</p>';

  return `
  <button class="btn ghost sm" onclick="goBack()" style="margin-bottom:14px">← Back</button>
  <div class="page-h" style="margin-bottom:16px"><div>
    <span class="gid" style="font-family:var(--fm);color:var(--accent);font-weight:700">${esc(g.id)}</span>
    <h1 style="margin-top:4px">${esc(g.brief||g.issueType)}</h1>
    <div style="display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap">
      ${statusPill(g.status)} <span class="badge">${esc(g.category)}</span>
      <span class="badge">Dept: ${esc(g.dept)}</span>
      ${g.reopened?'<span class="badge hot">Reopened</span>':''}
      ${over?'<span class="badge hot">⏱ Overdue</span>':''}
    </div></div></div>

  <div class="detail-grid">
    <div class="grid" style="grid-template-columns:1fr">
      <div class="card pad">
        <h3 style="font-size:15px;margin-bottom:12px">Issue details</h3>
        <dl class="kv">
          ${g.issueType?`<dt>Issue type</dt><dd>${esc(g.issueType)}</dd>`:''}
          <dt>Detailed explanation</dt><dd style="text-align:left;font-weight:500;color:var(--muted)">${esc(g.detail)}</dd>
          ${g.preferred?`<dt>Preferred resolution</dt><dd style="text-align:left;font-weight:500;color:var(--muted)">${esc(g.preferred)}</dd>`:''}
          ${g.callback?`<dt>Callback</dt><dd>${esc(g.callback.date)} · ${esc(g.callback.slot)} · ${esc(g.callback.num)}</dd>`:''}
          <dt>Submitted</dt><dd>${fmtDateTime(g.submittedAt)}</dd>
          <dt>Last updated</dt><dd>${fmtDateTime(g.updatedAt)}</dd>
          ${isAdmin?`<dt>Student</dt><dd>${esc(g.studentName)} · ${esc(g.roll)}</dd><dt>Course / Batch</dt><dd>${esc(g.course)} · ${esc(g.batch)}</dd><dt>Mobile</dt><dd>${esc(g.mobile)}</dd>`:''}
        </dl>
        ${g.attachment?attachmentView(g.attachment):''}
      </div>

      <div class="card pad">
        <h3 style="font-size:15px;margin-bottom:12px">Support team remarks</h3>
        ${remarksHtml}
      </div>

      ${isAdmin&&lastStu?`<div class="card pad"><h3 style="font-size:15px;margin-bottom:8px">Last message from student</h3>
        <div class="stu-msg">${esc(lastStu.text)}</div>
        <div style="font-size:11.5px;color:var(--faint);margin-top:6px">${esc(g.studentName)} · ${fmtDateTime(lastStu.at)}</div></div>`:''}

      ${isAdmin?adminActions(g):studentActions(g)}
    </div>

    <div class="card pad">
      <h3 style="font-size:15px;margin-bottom:16px">Status timeline</h3>
      <div class="timeline">${auditHtml}</div>
    </div>
  </div>`;
}
function attachmentView(a){
  if(a.dataUrl) return `<hr class="sep"><div style="font-size:12.5px;color:var(--muted);font-weight:600;margin-bottom:8px">Attachment</div>
    <img src="${a.dataUrl}" alt="${esc(a.name)}" style="max-width:100%;border-radius:10px;border:1px solid var(--border)">
    <div class="file-chip" style="margin-top:8px">${I.clip} ${esc(a.name)}</div>`;
  return `<hr class="sep"><div class="file-chip">${I.clip} ${esc(a.name)} · ${(a.size/1024).toFixed(0)} KB <span style="color:var(--faint)">(stored)</span></div>`;
}
function studentActions(g){
  if(g.status==='Resolved'||g.status==='Closed')
    return `<div class="card pad" style="text-align:center">
      <div style="font-size:30px">✅</div>
      <h3 style="font-size:16px;margin:8px 0 4px">This grievance has been resolved</h3>
      <p style="color:var(--muted);font-size:13px;max-width:430px;margin:0 auto 14px">Our team has marked this as resolved and the ticket is now closed. We hope it helped — if you're satisfied, there's nothing more you need to do.</p>
      <button class="btn primary" onclick="goBack()">Done</button>
      <div style="margin-top:14px"><a href="#" onclick="app.reopenPrompt('${g.id}');return false" style="font-size:12px;color:var(--faint);text-decoration:underline">Issue still not resolved? Reopen this ticket</a></div>
    </div>`;
  if(g.status==='Awaiting Student Response')
    return `<div class="card pad"><h3 style="font-size:15px;margin-bottom:10px">The team needs more information</h3>
      <textarea id="stu_reply" placeholder="Type your response to the support team…"></textarea>
      <button class="btn primary" style="margin-top:10px" onclick="studentReply('${g.id}')">Send response</button></div>`;
  return '';
}
function adminActions(g){
  return `<div class="card pad">
    <h3 style="font-size:15px;margin-bottom:14px">Manage grievance</h3>
    <label class="fld"><span>Update status</span>
      <select id="ad_status">${STATUSES.map(s=>`<option ${g.status===s?'selected':''}>${s}</option>`).join('')}</select></label>
    <button class="btn primary sm" onclick="adminUpdate('${g.id}')">Apply changes</button>
    <hr class="sep">
    <label class="fld"><span>Add resolution remark <span style="color:var(--faint);font-weight:500">(visible to student)</span></span>
      <textarea id="ad_remark" placeholder="Explain what you did / next steps for the student…"></textarea></label>
    <button class="btn sm" onclick="adminRemark('${g.id}')">Post remark to student</button>
    <hr class="sep">
    <label class="fld"><span>Internal note <span style="color:var(--faint);font-weight:500">(team only)</span></span>
      <textarea id="ad_note" placeholder="Private note for the team…"></textarea></label>
    <button class="btn sm" onclick="adminNote('${g.id}')">Save internal note</button>
    ${(g.notes||[]).length?`<div style="margin-top:12px">${(g.notes||[]).map(n=>`<div class="note-int"><b>${esc(n.by)}</b> · ${fmtDateTime(n.at)}<div style="margin-top:4px">${esc(n.text)}</div></div>`).join('')}</div>`:''}
  </div>`;
}

/* student detail actions */
function studentClose(id){
  const g=state.grievances[id]; const now=new Date().toISOString(); const by=state.session.name;
  patchGrievance(id,{status:'Closed',updatedAt:now,
    audit:[...(g.audit||[]),{at:now,by,action:'Closed by student',to:'Closed',student:true,kind:'ok',text:'You confirmed the issue is resolved. Thank you!'}]});
  toast('Grievance closed. Thank you!','ok'); render();
}
function studentReply(id){
  const t=($('#stu_reply').value||'').trim(); if(!t){toast('Please type a response.','warn');return;}
  const g=state.grievances[id]; const now=new Date().toISOString(); const by=state.session.name;
  patchGrievance(id,{status:'In Progress',updatedAt:now,lastStudentMsg:{text:t,at:now},
    audit:[...(g.audit||[]),{at:now,by,action:'Student responded',to:'In Progress',student:true,kind:'info',text:t}]});
  toast('Response sent to the support team.','ok'); render();
}

/* admin detail actions */
function adminUpdate(id){
  const g=state.grievances[id]; const ns=$('#ad_status').value;
  const now=new Date().toISOString(); const by=state.session.name; const audit=[...(g.audit||[])]; const patch={updatedAt:now};
  if(ns!==g.status){ patch.status=ns;
    const studentMsg={'Under Review':'Your grievance is being reviewed by our team.','In Progress':'Good news — our team is actively working on your issue.','Awaiting Student Response':'We need some more information from you. Please check and respond.','Resolved':'Your grievance has been resolved and this ticket is now closed. We hope it helped!'}[ns]||('Status updated to '+ns);
    patch.resolvedAt = (ns==='Resolved')? now : g.resolvedAt;
    audit.push({at:now,by,action:'Status updated',to:ns,student:true,kind:ns==='Resolved'?'ok':'warn',text:studentMsg}); }
  patch.audit=audit;
  patchGrievance(id,patch);
  toast('Grievance updated.','ok'); render();
}
function adminRemark(id){
  const t=($('#ad_remark').value||'').trim(); if(!t){toast('Write a remark first.','warn');return;}
  const g=state.grievances[id]; const now=new Date().toISOString(); const by=state.session.name;
  patchGrievance(id,{updatedAt:now,remarks:[...(g.remarks||[]),{by,at:now,text:t}],
    audit:[...(g.audit||[]),{at:now,by,action:'Added a resolution remark',student:true,kind:'info',text:t}]});
  toast('Remark posted — the student can see it.','ok'); render();
}
function adminNote(id){
  const t=($('#ad_note').value||'').trim(); if(!t){toast('Write a note first.','warn');return;}
  const g=state.grievances[id]; const now=new Date().toISOString(); const by=state.session.name;
  patchGrievance(id,{notes:[...(g.notes||[]),{by,at:now,text:t}]});
  toast('Internal note saved.','ok'); render();
}

/* ============================================================
   ADMIN — QUEUE / ANALYTICS / TEAM
   ============================================================ */
function adminBody(){
  switch(state.view){
    case 'admin-analytics': return viewAnalytics();
    case 'admin-callbacks': return viewCallbacks();
    case 'admin-team': return viewTeam();
    case 'admin-detail': return viewDetail(true);
    default: return viewQueue();
  }
}
function scopedList(){
  // role-based: agents see only their department; super admin sees all
  let list=allGrievances();
  const s=state.session;
  if(!s.superadmin && s.dept && s.dept!=='All') list=list.filter(g=>g.dept===s.dept);
  return list;
}
function viewQueue(){
  const f=state.filters; let list=scopedList();
  if(f.q){ const q=f.q.toLowerCase();
    list=list.filter(g=>g.studentName.toLowerCase().includes(q)||g.roll.toLowerCase().includes(q)||g.id.toLowerCase().includes(q)); }
  if(f.cat) list=list.filter(g=>g.category===f.cat);
  if(f.status) list=list.filter(g=>g.status===f.status);
  if(f.dept) list=list.filter(g=>g.dept===f.dept);
  if(f.from) list=list.filter(g=>new Date(g.submittedAt)>=new Date(f.from));
  const sm=summary(scopedList());
  const overdue=scopedList().filter(isOverdue).length;
  return `${dbBanner()}
  <div class="page-h"><div><h1>Grievance Queue</h1>
    <p>${state.session.superadmin?'All departments':esc(state.session.dept+' department')} · ${scopedList().length} total</p></div>
    <div style="margin-left:auto"><button class="btn primary sm" onclick="exportExcel()">${I.dl} Export to Excel</button></div></div>

  <div class="stats" style="margin-bottom:20px">
    ${statTile('all','Total',sm.total,'var(--accent)')}
    ${statTile('open','Open',sm.open,'var(--sky)')}
    ${statTile('prog','In Progress',sm.prog,'var(--warn)')}
    ${statTile('res','Resolved',sm.res,'var(--ok)')}
  </div>
  ${overdue?`<div class="banner">⏱ <b>${overdue}</b> grievance(s) are overdue (open longer than ${SLA_DAYS} days). Prioritise these.</div>`:''}

  <div class="filters">
    <div class="search-box">${I.search}<input placeholder="Search by name, roll number or ID…" value="${esc(f.q)}" oninput="app.filter('q',this.value)"></div>
    <div class="fg"><span>Category</span><select onchange="app.filter('cat',this.value)"><option value="">All</option>${Object.keys(CATEGORIES).map(c=>`<option ${f.cat===c?'selected':''}>${c}</option>`).join('')}</select></div>
    <div class="fg"><span>Status</span><select onchange="app.filter('status',this.value)"><option value="">All</option>${STATUSES.map(s=>`<option ${f.status===s?'selected':''}>${s}</option>`).join('')}</select></div>
    ${state.session.superadmin?`<div class="fg"><span>Department</span><select onchange="app.filter('dept',this.value)"><option value="">All</option>${['Academics','Finance','Operations','Tech Support'].map(d=>`<option ${f.dept===d?'selected':''}>${d}</option>`).join('')}</select></div>`:''}
    <div class="fg"><span>From date</span><input type="date" value="${esc(f.from)}" onchange="app.filter('from',this.value)"></div>
    ${(f.q||f.cat||f.status||f.dept||f.from)?`<button class="btn ghost sm" onclick="app.clearFilters()">Clear</button>`:''}
  </div>

  ${list.length?`<div class="tablewrap"><table>
    <thead><tr><th>ID</th><th>Student</th><th>Category / Issue</th><th>Dept</th><th>Updated</th><th>Status</th></tr></thead>
    <tbody>${list.map(g=>`<tr onclick="openGrievance('${g.id}')">
      <td style="font-family:var(--fm);color:var(--accent);font-weight:700;white-space:nowrap">${esc(g.id)}${isOverdue(g)?' <span class="badge hot" style="margin-left:4px">⏱</span>':''}</td>
      <td><div style="font-weight:700">${esc(g.studentName)}</div><div style="font-size:12px;color:var(--muted)">${esc(g.roll)}</div></td>
      <td><div style="font-weight:600">${esc(g.category)}</div><div style="font-size:12px;color:var(--muted)">${esc(g.issueType||g.brief)}</div></td>
      <td><span class="badge">${esc(g.dept)}</span></td>
      <td style="white-space:nowrap;font-size:12.5px;color:var(--muted)">${ago(g.updatedAt)}</td>
      <td>${statusPill(g.status)}</td></tr>`).join('')}</tbody></table></div>`
    : emptyState('No grievances match','Try clearing the filters, or wait for students to raise issues.')}`;
}

/* ---------- ANALYTICS ---------- */
function viewAnalytics(){
  const list=scopedList(); const sm=summary(list);
  const resolved=list.filter(g=>g.resolvedAt);
  const avgMs = resolved.length? resolved.reduce((a,g)=>a+(new Date(g.resolvedAt)-new Date(g.submittedAt)),0)/resolved.length : 0;
  const avgTxt = resolved.length? (avgMs/86400000).toFixed(1)+' days' : '—';
  // category distribution
  const byCat={}; Object.keys(CATEGORIES).forEach(c=>byCat[c]=0); list.forEach(g=>byCat[g.category]++);
  const maxCat=Math.max(1,...Object.values(byCat));
  // status distribution (donut)
  const byStatus={}; STATUSES.forEach(s=>byStatus[s]=0); list.forEach(g=>byStatus[g.status]++);
  // daily trend last 14 days
  const days=[]; for(let i=13;i>=0;i--){ const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-i); days.push(d); }
  const daily=days.map(d=>{ const n=d.getTime(),x=n+86400000;
    return list.filter(g=>{const t=new Date(g.submittedAt).getTime();return t>=n&&t<x;}).length; });
  // monthly trend last 6 months
  const months=[]; for(let i=5;i>=0;i--){ const d=new Date(); d.setDate(1); d.setMonth(d.getMonth()-i); months.push(d); }
  const monthly=months.map(d=>{ const y=d.getFullYear(),m=d.getMonth();
    return list.filter(g=>{const t=new Date(g.submittedAt);return t.getFullYear()===y&&t.getMonth()===m;}).length; });
  // team performance

  return `
  <div class="page-h"><div><h1>Support Analytics</h1><p>Live view of grievance volume, resolution speed and team load.</p></div>
    <div style="margin-left:auto"><button class="btn primary sm" onclick="exportExcel()">${I.dl} Export to Excel</button></div></div>

  <div class="stats" style="margin-bottom:18px">
    ${statTile('all','Total received',sm.total,'var(--accent)')}
    ${statTile('open','Open now',sm.open+sm.prog,'var(--sky)')}
    ${statTile('res','Resolved',sm.res,'var(--ok)')}
    <div class="stat"><div class="lab"><span class="dot" style="background:var(--info)"></span>Avg resolution</div><div class="num tnum" style="font-size:24px">${avgTxt}</div></div>
  </div>

  <div class="chart-grid">
    <div class="card pad">
      <h3 style="font-size:15px;margin-bottom:16px">Category-wise distribution</h3>
      ${Object.keys(byCat).map(c=>barRow(c,byCat[c],maxCat,'var(--accent)')).join('')}
    </div>
    <div class="card pad">
      <h3 style="font-size:15px;margin-bottom:16px">Status breakdown</h3>
      ${donut(byStatus,list.length)}
    </div>
    <div class="card pad">
      <h3 style="font-size:15px;margin-bottom:6px">Daily trend</h3>
      <p style="font-size:12px;color:var(--faint);margin-bottom:14px">Grievances raised · last 14 days</p>
      ${lineChart(daily,days.map(d=>d.getDate()))}
    </div>
    <div class="card pad">
      <h3 style="font-size:15px;margin-bottom:6px">Monthly trend</h3>
      <p style="font-size:12px;color:var(--faint);margin-bottom:14px">Grievances raised · last 6 months</p>
      ${monthBars(monthly,months.map(d=>d.toLocaleString('en-IN',{month:'short'})))}
    </div>
  </div>`;
}
function barRow(lab,val,max,color){
  return `<div class="bar-row"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(lab)}</div>
    <div class="bar-track"><div class="bar-fill" style="width:${Math.round(val/max*100)}%;background:${color}"></div></div>
    <div class="bv">${val}</div></div>`;
}
function donut(byStatus,total){
  const colors={'Submitted':'var(--sky)','Under Review':'var(--info)','In Progress':'var(--warn)','Awaiting Student Response':'#e0952f','Resolved':'var(--ok)','Closed':'var(--faint)'};
  if(!total) return '<p style="color:var(--faint);font-size:13px">No data yet.</p>';
  let acc=0; const R=54,C=2*Math.PI*R; const segs=[];
  STATUSES.forEach(s=>{ const v=byStatus[s]; if(!v)return; const frac=v/total;
    segs.push(`<circle r="${R}" cx="70" cy="70" fill="none" stroke="${colors[s]}" stroke-width="20" stroke-dasharray="${(frac*C).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-acc*C).toFixed(2)}" transform="rotate(-90 70 70)"/>`);
    acc+=frac; });
  return `<div class="donut-wrap"><svg width="140" height="140" viewBox="0 0 140 140">
      <circle r="${R}" cx="70" cy="70" fill="none" stroke="var(--surface-3)" stroke-width="20"/>${segs.join('')}
      <text x="70" y="66" text-anchor="middle" font-size="26" font-weight="800" fill="var(--fg)">${total}</text>
      <text x="70" y="84" text-anchor="middle" font-size="10" fill="var(--muted)">total</text></svg>
    <div class="legend" style="flex-direction:column;gap:7px;margin:0">
      ${STATUSES.filter(s=>byStatus[s]).map(s=>`<span><i style="background:${colors[s]}"></i>${esc(s)} · <b>${byStatus[s]}</b></span>`).join('')}
    </div></div>`;
}
function lineChart(data,labels){
  const W=360,H=140,P=24; const max=Math.max(1,...data); const n=data.length;
  const x=i=>P+(W-2*P)*(i/(n-1)); const y=v=>H-P-(H-2*P)*(v/max);
  const pts=data.map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area=`M${x(0)},${H-P} L`+data.map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' L')+` L${x(n-1)},${H-P} Z`;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="overflow:visible">
    <defs><linearGradient id="la" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".28"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
    ${[0,.5,1].map(f=>`<line x1="${P}" x2="${W-P}" y1="${(H-P-(H-2*P)*f).toFixed(1)}" y2="${(H-P-(H-2*P)*f).toFixed(1)}" stroke="var(--border)" stroke-width="1"/>`).join('')}
    <path d="${area}" fill="url(#la)"/>
    <polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
    ${data.map((v,i)=>v>0?`<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3" fill="var(--accent)"/>`:'').join('')}
    ${labels.map((l,i)=>i%2===0?`<text x="${x(i).toFixed(1)}" y="${H-6}" text-anchor="middle" font-size="9" fill="var(--faint)">${l}</text>`:'').join('')}
    <text x="${P}" y="${P-8}" font-size="9" fill="var(--faint)">${max}</text></svg>`;
}
function monthBars(data,labels){
  const W=360,H=140,P=24; const max=Math.max(1,...data); const n=data.length; const bw=(W-2*P)/n*0.6;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%">
    ${[0,.5,1].map(f=>`<line x1="${P}" x2="${W-P}" y1="${(H-P-(H-2*P)*f).toFixed(1)}" y2="${(H-P-(H-2*P)*f).toFixed(1)}" stroke="var(--border)" stroke-width="1"/>`).join('')}
    ${data.map((v,i)=>{const cx=P+(W-2*P)*((i+.5)/n);const h=(H-2*P)*(v/max);
      return `<rect x="${(cx-bw/2).toFixed(1)}" y="${(H-P-h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="var(--accent)"/>
        <text x="${cx.toFixed(1)}" y="${(H-P-h-5).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--muted)">${v||''}</text>
        <text x="${cx.toFixed(1)}" y="${H-6}" text-anchor="middle" font-size="9" fill="var(--faint)">${labels[i]}</text>`;}).join('')}
  </svg>`;
}

function viewCallbacks(){
  const list=scopedList().filter(g=>g.category==='Call Back Request'||g.callback);
  const pend=list.filter(g=>isOpen(g.status));
  return `${dbBanner()}
  <div class="page-h"><div><h1>Callback Requests</h1><p>Students who asked the team to call them back.</p></div>
    <div style="margin-left:auto"><button class="btn primary sm" onclick="exportExcel()">${I.dl} Export to Excel</button></div></div>
  <div class="stats" style="margin-bottom:20px">
    ${statTile('all','Total requests',list.length,'var(--accent)')}
    ${statTile('open','Pending',pend.length,'var(--sky)')}
    ${statTile('res','Done',list.length-pend.length,'var(--ok)')}
  </div>
  ${list.length?`<div class="tablewrap"><table>
    <thead><tr><th>ID</th><th>Student</th><th>Contact number</th><th>Preferred slot</th><th>Reason</th><th>Status</th></tr></thead>
    <tbody>${list.map(g=>`<tr onclick="openGrievance('${g.id}')">
      <td style="font-family:var(--fm);color:var(--accent);font-weight:700;white-space:nowrap">${esc(g.id)}</td>
      <td><div style="font-weight:700">${esc(g.studentName)}</div><div style="font-size:12px;color:var(--muted)">${esc(g.roll)}</div></td>
      <td style="white-space:nowrap;font-weight:600">${esc(g.callback?g.callback.num:(g.mobile||'—'))}</td>
      <td style="font-size:12.5px">${g.callback?esc(g.callback.date+' · '+g.callback.slot):'<span style="color:var(--faint)">—</span>'}</td>
      <td style="font-size:12.5px">${esc(g.issueType||g.brief)}</td>
      <td>${statusPill(g.status)}</td></tr>`).join('')}</tbody></table></div>`
    : emptyState('No callback requests yet','When a student requests a callback, it will appear here.')}`;
}

/* ---------- SLA ---------- */
function viewTeam(){
  const list=scopedList();
  const overdue=list.filter(isOverdue);
  const pending=list.filter(g=>isOpen(g.status));
  return `
  <div class="page-h"><div><h1>SLA Tracking</h1><p>Pending and overdue grievances (SLA: ${SLA_DAYS} days).</p></div></div>
  <div class="stats" style="margin-bottom:20px">
    ${statTile('open','Pending (open)',pending.length,'var(--sky)')}
    ${statTile('prog','Overdue',overdue.length,'var(--hot)')}
    ${statTile('res','Resolved',list.filter(g=>!isOpen(g.status)).length,'var(--ok)')}
  </div>
  <div class="sectionlabel">⏱ Overdue — needs attention</div>
  ${overdue.length?`<div class="glist" style="margin-bottom:22px">${overdue.map(gRow).join('')}</div>`:`<div class="banner info">✓ Nothing overdue. Great work keeping up with the SLA.</div>`}
  <div class="sectionlabel">Pending grievances</div>
  ${pending.length?`<div class="glist">${pending.map(gRow).join('')}</div>`:emptyState('All clear','No open grievances right now.')}`;
}

/* ============================================================
   EXPORT (Excel-compatible, via downloads capability)
   ============================================================ */
async function exportExcel(){
  const list=scopedList();
  if(!list.length){ toast('Nothing to export yet.','warn'); return; }
  const cols=['Grievance ID','Student','Roll No','Course','Batch','Mobile','Category','Issue Type','Brief','Department','Status','Submitted','Last Updated','Resolved'];
  const rows=list.map(g=>[g.id,g.studentName,g.roll,g.course,g.batch,g.mobile,g.category,g.issueType,g.brief,g.dept,g.status,fmtDateTime(g.submittedAt),fmtDateTime(g.updatedAt),g.resolvedAt?fmtDateTime(g.resolvedAt):'']);
  const html=`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table border="1"><tr>${cols.map(c=>`<th style="background:#00afc1;color:#fff">${c}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
  const filename=`GC-Grievances-${new Date().toISOString().slice(0,10)}.xls`;
  try{
    const blob=new Blob([html],{type:'application/vnd.ms-excel'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a');
    a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast('Export downloaded.','ok'); return;
  }catch(e){ /* fall through to copy view */ }
  // fallback: show CSV to copy
  const csv=[cols.join(','),...rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(','))].join('\n');
  showCopyModal('Export — copy this data',csv);
}
function showCopyModal(title,text){
  const o=document.createElement('div'); o.className='overlay';
  o.innerHTML=`<div class="modal wide"><h2 style="font-size:18px;margin-bottom:12px">${esc(title)}</h2>
    <textarea style="height:240px;font-family:var(--fm);font-size:12px" readonly>${esc(text)}</textarea>
    <div style="display:flex;gap:10px;margin-top:14px"><button class="btn primary" onclick="app.copyText(this)">Copy to clipboard</button>
    <button class="btn" onclick="this.closest('.overlay').remove()">Close</button></div></div>`;
  o.addEventListener('click',e=>{if(e.target===o)o.remove()});
  document.body.appendChild(o);
}

/* ============================================================
   NOTIFICATIONS
   ============================================================ */
function notifBell(){
  const notifs=myNotifs();
  const unread=notifs.filter(n=>new Date(n.at).getTime()>state.lastSeen).length;
  return `<div class="notif-wrap">
    <button class="btn ghost" style="position:relative" onclick="app.toggleNotif()">${I.bell}
      ${unread?`<span class="notif-dot">${unread}</span>`:''}</button>
    ${state.notifOpen?`<div class="notif-panel">
      <header>Notifications ${unread?`<button class="btn ghost sm" onclick="app.markSeen()">Mark all read</button>`:''}</header>
      <div class="notif-list">${notifs.length?notifs.slice(0,20).map(n=>{
        const un=new Date(n.at).getTime()>state.lastSeen;
        return `<div class="notif ${un?'unread':''}" onclick="openGrievance('${n.gid}')">
          <div class="ni" style="background:var(--accent-soft);color:var(--accent)">${I.bell}</div>
          <div style="min-width:0"><div class="nt">${esc(n.text||n.action)}</div>
          <div class="nm">${esc(n.gid)} · ${esc(n.cat)} · ${ago(n.at)}</div></div></div>`;}).join('')
        :'<div class="empty" style="padding:30px 20px"><p>No notifications yet.</p></div>'}</div>
      <div style="padding:10px 16px;border-top:1px solid var(--border);font-size:11.5px;color:var(--faint);text-align:center">
        🔔 In-portal alerts · WhatsApp &amp; email integration ready</div>
    </div>`:''}
  </div>`;
}

/* ============================================================
   CONTROLLER (app.*) + navigation
   ============================================================ */
function go(v){ state.view=v; state.railOpen=false; state.notifOpen=false;
  if(v!=='raise'&&v!=='callback'){ state.suspendSync=false; }
  if(v==='callback'){ state.draft={category:'Call Back Request'}; }
  if(v==='raise'){ state.draft=state.draft.category==='Call Back Request'?{}:state.draft; }
  render(); }
function goBack(){ state.suspendSync=false;
  state.view = state.session.type==='admin'?'admin-queue':'mine'; state.current=null; render(); }

const app={
  toggleRail(v){ state.railOpen=v; render(); },
  loginTab(t){ state.loginTab=t; state.loginErr=''; render(); },
  goStudent(e){ if(e&&e.preventDefault)e.preventDefault(); state.authMode='student'; state.loginErr=''; try{location.hash='';}catch(_){ } render(); },
  goAdmin(e){ if(e&&e.preventDefault)e.preventDefault(); state.authMode='admin'; state.loginErr=''; render(); },
  myFilter(f){ state.myFilter=f; render(); },
  filter(k,v){ state.filters[k]=v; render();
    // keep focus in search box after re-render
    if(k==='q'){ const el=$('.search-box input'); if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);} } },
  clearFilters(){ state.filters={q:'',cat:'',status:'',dept:'',from:''}; render(); },
  pickCat(c){ state.draft.category=c; state.draft.issueType=''; render(); },
  pickFile(input){
    const f=input.files[0]; if(!f)return;
    const meta={name:f.name,size:f.size,type:f.type};
    if(f.type.startsWith('image/')&&f.size<180*1024){
      const r=new FileReader(); r.onload=()=>{ meta.dataUrl=r.result; state.draft.file=meta;
        const c=$('#filechip'); if(c)c.innerHTML=fileChip(meta); }; r.readAsDataURL(f);
    }else{ state.draft.file=meta; const c=$('#filechip'); if(c)c.innerHTML=fileChip(meta); }
  },
  removeFile(){ state.draft.file=null; const c=$('#filechip'); if(c)c.innerHTML=''; const inp=$('#f_file'); if(inp)inp.value=''; },
  clearDraft(){ state.draft=state.draft.category==='Call Back Request'?{category:'Call Back Request'}:{}; render(); },
  captureDraft(){ /* read current inputs into draft before a re-render that keeps the form */ },
  toggleNotif(){ state.notifOpen=!state.notifOpen; render(); },
  markSeen(){ state.lastSeen=Date.now(); ls.set('seen_'+state.session.roll,state.lastSeen); render(); },
  closeSuccess(id){ const o=$('#successOverlay'); if(o)o.remove();
    if(id){ openGrievance(id); } else { go('mine'); } },
  reopenPrompt(id){
    const o=document.createElement('div'); o.className='overlay';
    o.innerHTML=`<div class="modal wide"><h2 style="font-size:18px">Reopen grievance</h2>
      <p style="color:var(--muted);font-size:13.5px;margin:8px 0 14px">Tell us why this isn't resolved and we'll pick it back up.</p>
      <textarea id="reopen_txt" placeholder="What's still unresolved?"></textarea>
      <div style="display:flex;gap:10px;margin-top:14px"><button class="btn primary" onclick="studentReopen('${id}')">Reopen</button>
      <button class="btn" onclick="this.closest('.overlay').remove()">Cancel</button></div></div>`;
    o.addEventListener('click',e=>{if(e.target===o)o.remove()});
    document.body.appendChild(o);
  },
  copyText(btn){ const ta=btn.closest('.modal').querySelector('textarea');
    try{ navigator.clipboard.writeText(ta.value).then(()=>{btn.textContent='Copied ✓';},()=>{ta.select();}); }
    catch(e){ ta.select(); } }
};
window.app=app; window.go=go; window.goBack=goBack; window.openGrievance=openGrievance;
window.studentLogin=studentLogin; window.adminLogin=adminLogin; window.logout=logout;
window.submitGrievance=submitGrievance; window.adminUpdate=adminUpdate; window.adminRemark=adminRemark;
window.adminNote=adminNote; window.studentClose=studentClose; window.studentReply=studentReply; window.exportExcel=exportExcel;
window.studentReopen=function(id){
  const t=($('#reopen_txt').value||'').trim(); if(!t){toast('Please tell us what\'s unresolved.','warn');return;}
  const g=state.grievances[id]; const now=new Date().toISOString(); const by=state.session.name;
  patchGrievance(id,{status:'Under Review',reopened:true,updatedAt:now,resolvedAt:null,lastStudentMsg:{text:t,at:now},
    audit:[...(g.audit||[]),{at:now,by,action:'Reopened by student',to:'Under Review',student:true,kind:'warn',text:t}]});
  document.querySelector('.overlay')?.remove(); toast('Grievance reopened. Our team will take another look.','ok'); render();
};

/* preserve in-progress form drafts across re-renders triggered by nav within the form:
   capture inputs on any interaction */
document.addEventListener('input',e=>{
  if(state.view!=='raise'&&state.view!=='callback')return;
  const map={f_brief:'brief',f_detail:'detail',f_res:'pref',f_cbdate:'cbdate',f_cbslot:'cbslot',f_cbnum:'cbnum',f_type:'issueType'};
  if(map[e.target.id]) state.draft[map[e.target.id]]=e.target.value;
},true);

/* ============================================================
   BOOT
   ============================================================ */
function syncAuthMode(){ state.authMode='student'; }
try{ window.addEventListener('hashchange',function(){ syncAuthMode(); if(!state.session) render(); }); }catch(e){}
(async function boot(){
  syncAuthMode();
  const saved=ls.get('gc_session',null);
  if(saved){ state.session=saved; state.view = saved.type==='admin'?'admin-queue':'mine';
    if(saved.roll) state.lastSeen=ls.get('seen_'+saved.roll,0); }
  state.booting=false; render();
  await initApi();
})();
